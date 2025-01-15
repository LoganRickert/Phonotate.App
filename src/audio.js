// General utility for resampling audio
export const resampleAudio = async (audioBuffer, targetSampleRate) => {
  if (!audioBuffer || audioBuffer.length === 0 || audioBuffer.duration === 0) {
    throw new Error('Invalid audioBuffer: No audio data available.');
  }

  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    Math.ceil(audioBuffer.duration * targetSampleRate),
    targetSampleRate
  );

  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start(0);

  const resampledBuffer = await offlineContext.startRendering();
  return resampledBuffer;
};


export const normalizeAudioBuffer = (audioBuffer) => {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const maxAmplitude = 1; // Maximum amplitude value for normalization

  // Find the overall maximum sample value across all channels
  let globalMax = 0;
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const channelMax = Math.max(...channelData.map((sample) => Math.abs(sample)));
    globalMax = Math.max(globalMax, channelMax);
  }

  // Calculate the normalization factor
  const normalizationFactor = globalMax > 0 ? maxAmplitude / globalMax : 1;

  // Create a new AudioBuffer for the normalized data
  const normalizedBuffer = new AudioContext().createBuffer(
    numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  // Normalize each channel
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const originalChannelData = audioBuffer.getChannelData(channel);
    const normalizedChannelData = normalizedBuffer.getChannelData(channel);
    for (let i = 0; i < originalChannelData.length; i++) {
      normalizedChannelData[i] = originalChannelData[i] * normalizationFactor;
    }
  }

  return normalizedBuffer;
};

export const compressAudioBuffer = (audioBuffer, threshold = -24, ratio = 4, attack = 0.003, release = 0.25) => {
  if (!audioBuffer || audioBuffer.length === 0 || audioBuffer.duration === 0) {
    throw new Error('Invalid audioBuffer: No audio data available.');
  }

  const audioContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    Math.ceil(audioBuffer.length),
    audioBuffer.sampleRate
  );

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;

  const compressor = audioContext.createDynamicsCompressor();
  compressor.threshold.value = threshold;
  compressor.ratio.value = ratio;
  compressor.attack.value = attack;
  compressor.release.value = release;

  source.connect(compressor);
  compressor.connect(audioContext.destination);

  return new Promise((resolve, reject) => {
    source.start(0);
    audioContext.startRendering().then(resolve).catch(reject);
  });
};

// General utility to save WAV files
export const saveWav = async (audioBuffer, filePath, targetSampleRate = null) => {
  let processedBuffer = audioBuffer;

  // Resample if target sample rate is provided
  if (targetSampleRate && targetSampleRate !== audioBuffer.sampleRate) {
    processedBuffer = await resampleAudio(audioBuffer, targetSampleRate);
  }

  // Encode the audio buffer to WAV format
  const wavData = encodeWav(processedBuffer);
  await window.electronAPI.saveFile(filePath, wavData);

  return wavData.byteLength;
};

// General utility to encode audio buffer into WAV format
export const encodeWav = (audioBuffer) => {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numberOfChannels * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const channels = [];
  for (let i = 0; i < numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  let offset = 0;

  // Write WAV header
  writeString(view, offset, 'RIFF'); offset += 4;
  view.setUint32(offset, 36 + audioBuffer.length * 2, true); offset += 4;
  writeString(view, offset, 'WAVE'); offset += 4;
  writeString(view, offset, 'fmt '); offset += 4;
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, numberOfChannels, true); offset += 2;
  view.setUint32(offset, audioBuffer.sampleRate, true); offset += 4;
  view.setUint32(offset, audioBuffer.sampleRate * numberOfChannels * 2, true); offset += 4;
  view.setUint16(offset, numberOfChannels * 2, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2;

  // Write data chunk
  writeString(view, offset, 'data'); offset += 4;
  view.setUint32(offset, audioBuffer.length * numberOfChannels * 2, true); offset += 4;

  // Write interleaved PCM data
  let index = 0;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      let sample = Math.max(-1, Math.min(1, channels[channel][i]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset + index, sample, true);
      index += 2;
    }
  }

  return new Uint8Array(buffer);
};

// General utility to export waveform as JPEG
export const exportWaveform = (waveformData, width = 1000, height = 50, color = '#007bff') => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  // Step 1: Draw white background
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Step 2: Render waveform
  if (waveformData && waveformData.data) {
    const amp = height / 2; // Amplitude scaling
    context.beginPath();
    context.moveTo(0, amp);

    const step = Math.ceil(waveformData.data.length / width);
    for (let i = 0; i < width; i++) {
      const slice = waveformData.data.slice(i * step, (i + 1) * step);
      const min = Math.min(...slice);
      const max = Math.max(...slice);
      context.lineTo(i, amp - amp * max);
      context.lineTo(i, amp - amp * min);
    }

    context.strokeStyle = color; // Waveform color
    context.lineWidth = 2;
    context.stroke();
  }

  // Step 3: Export canvas as JPEG
  const canvasDataUrl = canvas.toDataURL('image/jpeg');
  const base64Data = canvasDataUrl.split(',')[1];
  return Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
};
