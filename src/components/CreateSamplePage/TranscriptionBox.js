import React from 'react';

import { highlightDifferences } from '../../utils';

const TranscriptionBox = ({transcription, prompt, recordingTime, audioUrl}) => {
    return (<div
        className={`mt-4 p-3 rounded ${transcription.match ? 'bg-success text-white' : 'bg-danger text-white'
          }`}
      >
        <h5>Transcription:</h5>
        {transcription.failed && (
          <>
            <div>{transcription.text}</div>
          </>
        )}
        {!transcription.loading && !transcription.failed && (
          <>
            <div>
              <h5>Comparison:</h5>
              {highlightDifferences(prompt, transcription.text)}
            </div>
            <p>Recording Length: {recordingTime}s</p>
            <audio src={audioUrl} controls />
          </>
        )}
      </div>);
};

export default TranscriptionBox;
