import React from 'react';

const RecordingControls = ({
  recording,
  recordingTime,
  onRecord,
  onStop,
  onSkip,
  onNext,
  transcription
}) => {
  return (
    <div className="text-center mb-4">
      {!recording ? (
        <button
          className="btn btn-success btn-lg me-3"
          style={{ fontSize: '1.5rem', padding: '15px 30px' }}
          onClick={onRecord}
        >
          <i className="fas fa-microphone me-2"></i> Record
        </button>
      ) : (
        <button
          className="btn btn-danger btn-lg me-3"
          style={{ fontSize: '1.5rem', padding: '15px 30px' }}
          onClick={onStop}
        >
          <i className="fas fa-stop me-2"></i> Stop
        </button>
      )}
      {!recording && (
        <button
          className="btn btn-secondary btn-lg me-3"
          style={{ fontSize: '1.5rem', padding: '15px 30px' }}
          onClick={onSkip}
        >
          Skip
        </button>
      )}
      {transcription && transcription.text && <button
        className="btn btn-secondary btn-lg"
        style={{ fontSize: '1.5rem', padding: '15px 30px' }}
        onClick={onNext}
        disabled={!recordingTime && !recording}
      >
        Next
      </button>}
      {recording && <div className="mt-2">Recording Time: {recordingTime}s</div>}
    </div>
  );
};

export default RecordingControls;
