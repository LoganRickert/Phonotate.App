import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importing the useNavigate hook from react-router-dom

const ProjectRow = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate(); // Hook to navigate to another page

  const formattedDate = new Date(project.date_created).toLocaleDateString();
  const formattedTime = new Date(project.date_created).toLocaleTimeString();
  
  const goodSamples = project.samples.filter((sample) => sample.rating === 1);
  const goodSamplesCount = goodSamples.length;
  const totalLength = goodSamples.reduce((total, sample) => total + sample.length_seconds, 0);

  // Handle view button click to navigate to the ProjectPage
  const handleViewClick = () => {
    navigate(`/project/${project.id}`); // Navigate to ProjectPage with project UUID
  };

  return (
    <div className="col-12" key={project.id}>
      <div className="card mb-4 shadow-sm rounded">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">{project.name}</h5>
            <div className="d-flex">
              <button
                className="btn btn-warning btn-sm mx-1"
                onClick={() => onEdit(project)}  // Open modal for editing
                aria-label={`Edit project ${project.name}`}
              >
                <i className="fas fa-edit"></i> Edit
              </button>
              <button
                className="btn btn-danger btn-sm mx-1"
                onClick={() => onDelete(project.id)}  // Delete project
                aria-label={`Delete project ${project.name}`}
              >
                <i className="fas fa-trash"></i> Delete
              </button>
              <button
                className="btn btn-info btn-sm mx-1"
                onClick={handleViewClick}  // Navigate to the ProjectPage
                aria-label={`View details of project ${project.name}`}
                style={{
                  backgroundColor: '#007bff', // Ensure contrast is high
                  color: 'white',
                }}
                onFocus={(e) => e.target.style.backgroundColor = '#0056b3'} // Focus effect
                onBlur={(e) => e.target.style.backgroundColor = '#007bff'} // Reset focus effect
              >
                <i className="fas fa-eye"></i> View
              </button>
            </div>
          </div>

          {/* Voice Actor and Description */}
          <div className="card-text mt-2">
            <strong>Voice Actor:</strong>
            <div>{project.voice_actor}</div>
          </div>

          {/* Display number of good samples and total length */}
          <div className="d-flex justify-content-between mt-3 mb-3">
            <div>
              <strong>Good Samples: </strong>{goodSamplesCount}
            </div>
            <div>
              <strong>Total Length: </strong>{(totalLength / 60).toFixed(1)} minutes
            </div>
          </div>

          <div className="card-text mt-2">
            <strong>Description</strong>
            <div>{project.description}</div>
          </div>
        </div>
        <div className="card-footer text-muted text-end" style={{ fontSize: '0.9rem' }}>
          Created: {formattedDate} at {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default ProjectRow;
