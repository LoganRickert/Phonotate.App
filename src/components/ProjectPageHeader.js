import React, { useState } from 'react';

const ProjectPageHeader = ({ project }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const goodSamples = project.samples ? project.samples.filter((sample) => sample.rating === 1) : [];
  const badSamples = project.samples ? project.samples.filter((sample) => sample.rating === 0) : [];
  const totalGoodLength = goodSamples.reduce((total, sample) => total + sample.length_seconds, 0);
  const totalLength = project.samples
    ? project.samples.reduce((total, sample) => total + sample.length_seconds, 0)
    : 0;

  return (
    <div className="card mb-4 shadow-sm">
      <div
        className="card-header d-flex justify-content-between align-items-center"
        style={{ cursor: 'pointer' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h5 className="mb-0">Project Overview</h5>
        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
      </div>
      {isExpanded && (
        <div className="card-body">
          <div className="mt-3">
            <p><strong>Project ID:</strong> {project.id}</p>
            <p><strong>Voice Actor:</strong> {project.voice_actor}</p>
            <p><strong>Author ID:</strong> {project.author_id}</p>
            <p><strong>Good Samples:</strong> {goodSamples.length}</p>
            <p><strong>Bad Samples:</strong> {badSamples.length}</p>
            <p><strong>Total Good Length:</strong> {(totalGoodLength/60).toFixed(1)} minutes</p>
            <p><strong>Total Length:</strong> {(totalLength/60).toFixed(1)} minutes</p>
            <p><strong>Description:</strong> {project.description}</p>
            <p><strong>Created:</strong> {new Date(project.date_created).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPageHeader;
