import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PromptBox from './CreateSamplePage/PromptBox';
import WaveformDisplay from './CreateSamplePage/WaveformDisplay';
import RecordingControls from './CreateSamplePage/RecordingControls';
import { exportWaveform, saveWav, encodeWav, resampleAudio } from '../audio';
import TranscriptionBox from './CreateSamplePage/TranscriptionBox';
import { generateModelMessage } from '../utils';

const CreateSamplePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [promptAudioUrl, setPromptAudioUrl] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunks = useRef([]);
  const [liveData, setLiveData] = useState(null);
  const [recentPrompts, setRecentPrompts] = useState([]);
  const [recentSkippedPrompts, setRecentSkippedPrompts] = useState([]);
  const [timerInterval, setTimerInterval] = useState(null);
  const [transcription, setTranscription] = useState({ text: '', loading: false, match: false, failed: false });
  const [wordAudioUrl, setWordAudioUrl] = useState({});

  useEffect(() => {
    fetchPrompt();
  }, []);

  useEffect(() => {
    setPromptAudioUrl(null);
  }, [prompt]);

  const fetchPrompt = async () => {
    setLoading(true);
    try {
      const settings = await window.electronAPI.getSettings();
      const apiUrl = settings.chatgptApiUrl;
      const token = settings.chatgptToken;
      const model = settings.model;

      const response = await fetch(`${apiUrl}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'gpt-3.5-turbo',
          messages: generateModelMessage(
            recentSkippedPrompts, recentPrompts
          ),
          max_tokens: 100,
        }),
      });

      const data = await response.json();
      let assistantMessage = data?.choices?.[0]?.message?.content || '';

      if (assistantMessage.startsWith('"') && assistantMessage.endsWith('"')) {
        assistantMessage = assistantMessage.slice(1, -1); // Remove quotes
      }

      const newPrompt = assistantMessage.trim();

      if (newPrompt) {
        setPrompt(newPrompt.replace("\n", " "));
      } else {
        setPrompt('Failed to fetch a new unique prompt.');
      }
    } catch (error) {
      console.error('Error fetching prompt:', error);
      setPrompt('');
    } finally {
      setLoading(false);
    }
  };

  const handleRecord = async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted:', stream);

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      source.connect(analyser);

      const dataArray = new Float32Array(analyser.fftSize);
      const amp = 50; // Adjust amplitude for visual scaling
      let accumulatedData = []; // Accumulate data over time

      const recorder = new MediaRecorder(stream);
      console.log('MediaRecorder initialized:', recorder);

      setMediaRecorder(recorder);

      if (audioUrl) {
        console.log('Clearing previous recording...');
        URL.revokeObjectURL(audioUrl); // Clear previous recording
        setAudioUrl(null);
      }

      audioChunks.current = [];
      recorder.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      const renderLiveWaveform = () => {
        if (recorder.state === 'recording') {
          analyser.getFloatTimeDomainData(dataArray);

          // Accumulate the data over time
          accumulatedData = [...accumulatedData, ...Array.from(dataArray)];

          // Update the `liveData` state with the accumulated data
          setLiveData({ data: accumulatedData, amp });

          requestAnimationFrame(renderLiveWaveform);
        }
      };

      recorder.onstop = async () => {
        const settings = await window.electronAPI.getSettings();

        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        
        // Re-encode the wave file so <Audio> will correctly
        // play the file and know how long it is.
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const processedBuffer = await resampleAudio(audioBuffer, 44100);
        const wavData = encodeWav(processedBuffer);
        const wavDataBlob = new Blob([wavData], { type: "audio/wav" });

        setAudioUrl(URL.createObjectURL(wavDataBlob));

        try {
          const asrServiceUrl = settings.asrServiceUrl;
          const openaiWhisperUrl = settings.openaiWhisperUrl;

          setTranscription({ text: '', loading: true, match: false, failed: false });

          let response;

          if (asrServiceUrl) {
            const formData = new FormData();
            formData.append('audio_file', audioBlob, 'audio.wav');

            // Use the custom ASR service
            response = await fetch(`${asrServiceUrl}?encode=true&task=transcribe&language=en&output=json`, {
              method: 'POST',
              body: formData,
            });
          } else if (openaiWhisperUrl) {
            // Use OpenAI Whisper
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.wav');
            formData.append('model', "whisper-1");

            response = await fetch(openaiWhisperUrl, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${settings.openaiWhisperToken}`,
              },
              body: formData,
            });
          } else {
            // No ASR service URL or OpenAI Whisper URL is configured
            setTranscription({ text: 'Failed to transcribe. No transcription service available.', loading: false, match: false, failed: true });
            return;
          }

          if (response.ok) {
            const data = await response.json();

            const preprocessText = (text) => {
              return text
                .toLowerCase() // Normalize casing
                .replace(/[\p{P}$+<=>^`|~]/gu, '') // Remove punctuation
                .trim();
            };

            const transcriptionText = preprocessText(data.text);
            const groundTruth = preprocessText(prompt);

            const match = transcriptionText === groundTruth;

            setTranscription({ text: transcriptionText, loading: false, match, failed: false });
          } else {
            setTranscription({ text: 'Failed to transcribe.', loading: false, match: false, failed: true });
          }
        } catch (error) {
          console.log("Error", error);
          setTranscription({ text: 'Error during transcription.', loading: false, match: false, failed: true });
        }
      };

      recorder.start();
      console.log('Recording started...');
      setRecording(true);

      const startTime = Date.now();
      setTimerInterval(setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        setRecordingTime(elapsedTime);
        console.log('Recording time:', elapsedTime, 'seconds');
      }, 1000))

      renderLiveWaveform(); // Start rendering the live waveform
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Failed to access microphone. Please check your permissions.');
    }
  };

  const handleStop = async () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setRecording(false);
      clearInterval(timerInterval);
    }
  };

  const handleSkip = () => {
    setAudioUrl(null);
    setLiveData(null);
    setTranscription({ text: '', loading: false, match: false, failed: false });
    
    // Update the recent prompts list (keep only the last 20)
    setRecentSkippedPrompts((prevPrompts) => {
      const updatedPrompts = [...prevPrompts, prompt];
      return updatedPrompts.slice(-10); // Keep only the last 20 prompts
    });

    fetchPrompt();
  };

  const handleSave = (newPrompt) => {
    setPrompt(newPrompt);
  };

  const handlePlay = async (text, singleWord) => {
    const settings = await window.electronAPI.getSettings();
    let _promptAudioUrl = promptAudioUrl;
    const _wordAudioUrl = wordAudioUrl;

    try {
      if (singleWord) {
        if (!_wordAudioUrl[text]) {
          const response = await fetch(settings.openaiTTSUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${settings.openaiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: text,
              voice: settings.openaiTTSVoice || 'af_bella', // Use an appropriate voice name
              format: 'audio/mp3',       // Format for the output audio
              speed: 1.1
            }),
          });
      
          if (!response.ok) {
            throw new Error(`TTS API error: ${response.statusText}`);
          }
      
          const blob = await response.blob();
          _wordAudioUrl[text] = URL.createObjectURL(blob);
      
          setWordAudioUrl(_wordAudioUrl);
        }
        
        return _wordAudioUrl[text];
      } else {
        if (!_promptAudioUrl) {
          const response = await fetch(settings.openaiTTSUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${settings.openaiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: text,
              voice: settings.openaiTTSVoice || 'af_bella', // Use an appropriate voice name
              format: 'audio/mp3',       // Format for the output audio
              speed: 1.1
            }),
          });
      
          if (!response.ok) {
            throw new Error(`TTS API error: ${response.statusText}`);
          }
      
          const blob = await response.blob();
          _promptAudioUrl = URL.createObjectURL(blob);
      
          setPromptAudioUrl(_promptAudioUrl);
        }
        
        return _promptAudioUrl;
      }
    } catch (error) {
      console.error('Error with TTS API:', error);
      alert('Failed to generate audio from the OpenAI API. Please try again.');
    }
  };

  const handleNext = async () => {
    const project = await window.electronAPI.getProject(id);
    const storagePath = project.storage_path;

    if (!storagePath) {
      alert('Storage path is not set.');
      return;
    }

    const uuid = crypto.randomUUID();
    const wavFilePath24 = `${storagePath}/${uuid}-24.wav`;
    const wavFilePath = `${storagePath}/${uuid}.wav`;
    const waveformFilePath = `${storagePath}/${uuid}.jpg`;

    // Update the recent prompts list (keep only the last 20)
    setRecentPrompts((prevPrompts) => {
      const updatedPrompts = [...prevPrompts, prompt];
      return updatedPrompts.slice(-10); // Keep only the last 20 prompts
    });

    try {
      // Save audio
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Normalize the audio buffer
      // It and compressAudioBuffer don't work
      // const normalizedBuffer = normalizeAudioBuffer(audioBuffer);

      const waveFileSize = await saveWav(audioBuffer, wavFilePath, 44100);
      const waveFileSize24 = await saveWav(audioBuffer, wavFilePath24, 24000);

      // Save waveform
      const waveformFile = exportWaveform(liveData);
      await window.electronAPI.saveFile(waveformFilePath, waveformFile);

      // Add to database
      const newSample = {
        id: uuid,
        project_id: id, // The project UUID
        recording_length: recordingTime,
        size_bytes: waveFileSize + waveFileSize24, // WAV file size in bytes
        text_said: transcription.text, // Transcription result
        ground_truth: prompt, // Original prompt
        match: transcription.match, // Boolean indicating if transcription matches the prompt
        file_path: wavFilePath, // Path to the WAV file
        file_path24: wavFilePath24, // Path to the WAV file
        waveform_path: waveformFilePath, // Path to the waveform image
      };

      await window.electronAPI.addSample(newSample);

      // Reset state
      setAudioUrl(null);
      setLiveData(null);
      setTranscription({ text: '', loading: false, match: false, failed: false });
      fetchPrompt();
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save the sample.');
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Record New Sample</h1>
        <button className="btn btn-primary" onClick={() => navigate(`/project/${id}`)}>
          <i className="fas fa-arrow-left"></i> Return to Project
        </button>
      </div>

      <PromptBox
        loading={loading}
        prompt={prompt}
        onRetry={fetchPrompt}
        onPlay={handlePlay}
        onSave={handleSave}
      />
      <WaveformDisplay liveData={liveData} />
      <RecordingControls
        recording={recording}
        recordingTime={recordingTime}
        transcription={transcription}
        onRecord={handleRecord}
        onStop={handleStop}
        onNext={handleNext}
        onSkip={handleSkip}
      />

      {audioUrl && (
        <TranscriptionBox
          transcription={transcription}
          prompt={prompt}
          recordingTime={recordingTime}
          audioUrl={audioUrl}
        />
      )}
    </div>
  );
};

export default CreateSamplePage;
