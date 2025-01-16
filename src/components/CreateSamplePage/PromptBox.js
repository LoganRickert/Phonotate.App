import React, { useState, useRef, useEffect } from 'react';

const PromptBox = ({ loading, prompt, onRetry, onPlay, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(prompt);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    setEditedPrompt(prompt);
  }, [prompt]);

  const handleEditClick = () => {
    if (isEditing) {
      onSave(editedPrompt);
    }
    setIsEditing(!isEditing);
  };

  const handlePlayClick = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      try {
        const audioUrl = await onPlay(editedPrompt);
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      } catch (error) {
        console.error('Error playing audio:', error);
        alert('Failed to play audio. Please try again.');
      }
    }
  };

  return (
    <>
      <div className="card mb-3">
        <div className="card-body text-center">
          {loading ? (
            <div>
              <img
                src="./images/loading.gif"
                alt="Loading..."
                style={{ width: '50px', marginBottom: '10px' }}
              />
              <p>Getting new prompt...</p>
            </div>
          ) : (
            <>
              {isEditing ? (
                <textarea
                  className="form-control mb-3"
                  rows="7"
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  aria-label="Edit prompt text"
                />
              ) : (
                <h5 tabIndex="0" aria-live="polite">
                  {editedPrompt} ({editedPrompt.length})
                </h5>
              )}
              <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
            </>
          )}
        </div>
      </div>
      <div className="d-flex justify-content-between mb-3">
        <button
          className="btn btn-primary d-flex align-items-center"
          onClick={handlePlayClick}
          aria-label={'Play audio'}
        >
          <i className={`fas ${isPlaying ? 'fa-stop' : 'fa-play'}`} aria-hidden="true"></i>
          <span className="ms-2">{isPlaying ? 'Stop' : 'Play'}</span>
        </button>
        <button
          className="btn btn-secondary d-flex align-items-center"
          onClick={handleEditClick}
          aria-label={isEditing ? 'Save prompt' : 'Edit prompt'}
        >
          <i className={`fas ${isEditing ? 'fa-save' : 'fa-edit'}`} aria-hidden="true"></i>
          <span className="ms-2">{isEditing ? 'Save' : 'Edit'}</span>
        </button>
        {!loading && !editedPrompt && !isEditing && <button
          className="btn btn-danger d-flex align-items-center"
          onClick={onRetry}
          aria-label="Retry fetching prompt"
        >
          <i className="fas fa-redo" aria-hidden="true"></i>
          <span className="ms-2">Retry</span>
        </button>}
      </div>
    </>
  );
};

export default PromptBox;
