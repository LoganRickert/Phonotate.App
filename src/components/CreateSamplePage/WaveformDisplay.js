import React, { useRef, useEffect } from 'react';

const WaveformDisplay = ({ audioBuffer, liveData }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Draw white background
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Now render the waveform on top of the white background
    context.beginPath();
    
    if (liveData) {
      // Render live audio data
      const { data, amp } = liveData;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath();
      context.moveTo(0, amp);

      const step = Math.ceil(data.length / canvas.width);
      for (let i = 0; i < canvas.width; i++) {
        const slice = data.slice(i * step, (i + 1) * step);
        const min = Math.min(...slice);
        const max = Math.max(...slice);
        context.lineTo(i, amp - amp * max);
        context.lineTo(i, amp - amp * min);
      }

      context.strokeStyle = '#007bff';
      context.lineWidth = 1;
      context.stroke();
    } else if (audioBuffer) {
      // Render static audioBuffer data
      const data = audioBuffer.getChannelData(0);
      const step = Math.ceil(data.length / canvas.width);
      const amp = canvas.height / 2;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath();
      context.moveTo(0, amp);

      for (let i = 0; i < canvas.width; i++) {
        const slice = data.slice(i * step, (i + 1) * step);
        const min = Math.min(...slice);
        const max = Math.max(...slice);
        context.lineTo(i, amp - amp * max);
        context.lineTo(i, amp - amp * min);
      }

      context.strokeStyle = '#007bff';
      context.lineWidth = 1;
      context.stroke();
    }
  }, [audioBuffer, liveData]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100px', backgroundColor: '#f8f9fa', marginBottom: '20px' }}
    />
  );
};

export default WaveformDisplay;