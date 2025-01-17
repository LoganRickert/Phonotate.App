import React from 'react';
import { preprocessText, highlightDifferences } from '../utils';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

const SampleRow = ({ sample, onEdit, onThumbsChange, onDelete }) => {
  if (!sample) return null;

  const textSaid = sample?.text_said || '';
  const groundTruth = sample?.ground_truth || '';
  const filePath = sample?.file_path || '';
  const waveformPath = sample?.waveform_path || '';
  const lengthSeconds = sample?.length_seconds || 0;

  const groundWords = preprocessText(groundTruth).join(' ');
  const transcriptionWords = preprocessText(textSaid).join(' ');
  const textSaidMatch = transcriptionWords === groundWords;

  // Dynamically format file size
  const formatFileSize = (size) => {
    if (size < 1024) return `${size} bytes`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };
  const fileSizeFormatted = sample?.size_bytes ? formatFileSize(sample.size_bytes) : 'N/A';

  const dateRecorded = sample?.date_recorded ? new Date(sample.date_recorded) : null;
  const formattedDate = dateRecorded ? dateRecorded.toLocaleDateString() : 'N/A';
  const formattedTime = dateRecorded ? dateRecorded.toLocaleTimeString() : 'N/A';

  return (
    <div className="col-12 mb-3">
      <div
        className="card shadow-sm rounded"
        style={{
          backgroundColor: sample.rating === 1 ? '#d4edda' : '#f8d7da',
          border: '1px solid',
          borderColor: sample.rating === 1 ? '#c3e6cb' : '#f5c6cb',
        }}
      >
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0" style={{ padding: '10px' }}>{sample.id}</h5>
            <div className="d-flex align-items-center">
              <button className="btn btn-warning btn-sm me-2" onClick={() => onEdit(sample)}>
                <i className="fas fa-edit"></i> Edit
              </button>
              <button
                className={`btn btn-sm ${sample.rating === 0 ? 'btn-success' : 'btn-secondary'} me-2`}
                onClick={() => onThumbsChange(sample.id, sample.rating === 1 ? 0 : 1)}
              >
                <i className={`fas ${sample.rating === 0 ? 'fa-thumbs-up' : 'fa-thumbs-down'}`}></i>
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onDelete(sample.id)}
              >
                <i className="fas fa-trash-alt"></i> Delete
              </button>
            </div>
          </div>
          {/* Waveform image */}
          {waveformPath && (
            <div className="mb-3">
              <img
                src={waveformPath}
                alt="Waveform"
                style={{ width: '100%', borderRadius: '5px' }}
              />
            </div>
          )}
          {/* Audio player */}
          <div className="mb-3">
            {filePath ? (
              <AudioPlayer
                src={filePath}
                style={{ width: '100%' }}
                onPlay={(e) => console.log('Playing audio')}
                showJumpControls={false}
              />
            ) : (
              <p>No audio file available</p>
            )}
          </div>
          {/* Ground Truth and Whisper Prediction */}
          <div className="card-text">
            <strong style={{ padding: '0 5px' }}>Ground Truth:</strong>
            <div style={{ marginBottom: '10px', padding: '5px' }}>{groundTruth}</div>
            {textSaid && (
              <div
                style={{
                  backgroundColor: textSaidMatch ? '#d4edda' : '#f8d7da',
                  borderRadius: '5px',
                  padding: '10px',
                }}
              >
                <strong>Whisper Prediction:</strong>
                <div>{highlightDifferences(groundTruth, textSaid)}</div>
              </div>
            )}
          </div>
        </div>
        <div className="card-footer d-flex justify-content-between text-muted" style={{ fontSize: '0.9rem' }}>
          <div>
            {Math.round(lengthSeconds)} seconds • {fileSizeFormatted}
          </div>
          <div>
            {formattedDate} at {formattedTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleRow;
