import React, { useState } from 'react';

const SampleModal = ({ showModal, closeModal, onSave, editingSample }) => {
  const [sample, setSample] = useState(editingSample || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSample({ ...sample, [name]: value });
  };

  const handleSubmit = () => {
    onSave(sample); // Call the save handler with the updated sample
    closeModal();   // Close the modal
  };

  if (!showModal) return null; // Don't render the modal if it's not shown

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{editingSample ? 'Edit Sample' : 'Add Sample'}</h5>
            <button type="button" className="btn-close" onClick={closeModal}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="text" className="form-label">Text Said</label>
              <input
                type="text"
                className="form-control"
                id="text"
                name="text_said"
                value={sample.text_said || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="groundTruth" className="form-label">Ground Truth</label>
              <input
                type="text"
                className="form-control"
                id="groundTruth"
                name="ground_truth"
                value={sample.ground_truth || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="rating" className="form-label">Rating</label>
              <select
                className="form-select"
                id="rating"
                name="rating"
                value={sample.rating || 0}
                onChange={handleChange}
              >
                <option value={1}>Good</option>
                <option value={0}>Bad</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleModal;
