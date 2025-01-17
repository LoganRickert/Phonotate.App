import React from 'react';
import { highlightDifferences } from '../../utils';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

const TranscriptionBox = ({ transcription, prompt, recordingTime, audioUrl }) => {
  return (
    <div
      className={`mt-4 p-3 rounded ${
        transcription.match ? 'bg-success text-white' : 'bg-danger text-white'
      }`}
    >
      <h5>Transcription:</h5>
      {transcription.loading ? (
        <div className="text-center">
          <img
            src="./images/loading.gif"
            alt="Loading..."
            style={{ width: '50px', marginBottom: '10px' }}
          />
          <p>Transcribing...</p>
        </div>
      ) : transcription.failed ? (
        <div>{transcription.text}</div>
      ) : (
        !transcription.loading &&
        !transcription.failed && (
          <>
            <div>
              <h5>Comparison:</h5>
              {highlightDifferences(prompt, transcription.text)}
            </div>
            <p>Recording Length: {recordingTime}s</p>
            <AudioPlayer
              src={audioUrl}
              style={{ width: '100%' }}
              onPlay={(e) => console.log('Playing audio')}
              showJumpControls={false}
            />
          </>
        )
      )}
    </div>
  );
};

export default TranscriptionBox;
