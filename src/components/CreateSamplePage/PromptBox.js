import React from 'react';

const PromptBox = ({ loading, prompt, onRetry }) => {
  return (
    <div className="card mb-4">
      <div className="card-body text-center">
        {loading ? (
          <div>
            <img src="./images/loading.gif" alt="Loading..." style={{ width: '50px', marginBottom: '10px' }} />
            <p>Getting new prompt...</p>
          </div>
        ) : prompt ? (
          <h5>{prompt} ({prompt.length})</h5>
        ) : (
          <div>
            <p>Failed to fetch prompt. Please try again.</p>
            <button className="btn btn-secondary" onClick={onRetry}>
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptBox;
