import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectModal from './ProjectModal';
import SampleModal from './SampleModal';
import ProjectPageHeader from './ProjectPageHeader';
import SampleRow from './SampleRow';
import { generateFileContent } from "../utils";

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingSample, setEditingSample] = useState(null);
  const [filteredSamples, setFilteredSamples] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    window.electronAPI.getProject(id).then((data) => {
      const sortedSamples = sortSamples(data.samples || [], 'newest');
      setProject({ ...data, samples: sortedSamples });
      setFilteredSamples(sortedSamples);
    });
  }, [id]);

  const sortSamples = (samples, order) => {
    return [...samples].sort((a, b) => {
      const dateA = new Date(a.date_recorded);
      const dateB = new Date(b.date_recorded);
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = project.samples.filter((sample) =>
      sample.text_said.toLowerCase().includes(query) ||
      sample.ground_truth.toLowerCase().includes(query) ||
      sample.id.toLowerCase().includes(query)
    );
    setFilteredSamples(sortSamples(filtered, sortOrder));
  };

  const handleSort = (e) => {
    const order = e.target.value;
    setSortOrder(order);
    setFilteredSamples(sortSamples(filteredSamples, order));
  };

  const handleGenerateTrainingData = async () => {
    if (!project || !project.samples) return;
    const settings = await window.electronAPI.getSettings();

    const filteredSamples = project.samples.filter((sample) => sample.rating >= 1);
    const randomizedSamples = [...filteredSamples].sort(() => Math.random() - 0.5);

    const valSplitIndex = Math.ceil(randomizedSamples.length * 0.15);
    const valSamples = randomizedSamples.slice(0, valSplitIndex);
    const trainSamples = randomizedSamples.slice(valSplitIndex);

    const valContent = await generateFileContent(settings, project, valSamples, true); // Phonemized
    const trainContent = await generateFileContent(settings, project, trainSamples, false); // Plain ground truth

    try {
      const valFilePath = `${project.storage_path}/${project.id}_val_list.txt`;
      const trainFilePath = `${project.storage_path}/${project.id}_train_list.txt`;

      await window.electronAPI.saveFile(valFilePath, valContent);
      await window.electronAPI.saveFile(trainFilePath, trainContent);

      alert('Training and validation text files generated successfully.');
    } catch (error) {
      console.error('Error generating training files:', error);
      alert('Failed to generate training and validation text files.');
    }
  };

  const handleEditProject = () => {
    setShowProjectModal(true);
  };

  const handleEditSample = (sample) => {
    setEditingSample(sample);
  };

  const handleDeleteSample = async (sampleId) => {
    const confirmed = window.confirm('Are you sure you want to delete this sample?');
    if (confirmed) {
      await window.electronAPI.deleteSample(sampleId);
      setFilteredSamples((prevSamples) => prevSamples.filter((sample) => sample.id !== sampleId));
      setProject((prevProject) => ({
        ...prevProject,
        samples: sortSamples(prevProject.samples.filter((sample) => sample.id !== sampleId), sortOrder),
      }));
    }
  };

  const handleThumbsChange = (sampleId, rating) => {
    const updatedSamples = sortSamples(project.samples.map((s) =>
      s.id === sampleId ? { ...s, rating } : s
    ), sortOrder);
    setProject({ ...project, samples: updatedSamples });
    setFilteredSamples(updatedSamples);
    const sample = updatedSamples.find((s) => s.id === sampleId);
    window.electronAPI.updateSample({ ...sample, rating });
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>{project.name}</h1>
        <div>
          <button className="btn btn-primary me-2" onClick={() => navigate('/')}>
            <i className="fas fa-arrow-left"></i> Return to Projects
          </button>
          <button className="btn btn-warning" onClick={handleEditProject}>
            <i className="fas fa-edit me-1"></i> Edit
          </button>
        </div>
      </div>

      <div className="text-end my-3">
        <button
          className="btn btn-secondary"
          onClick={handleGenerateTrainingData}
        >
          <i className="fas fa-file-alt me-2"></i> Generate Training Text
        </button>
      </div>

      <ProjectPageHeader project={project} />

      <div className="text-center my-4">
        <button
          className="btn btn-success btn-lg d-flex align-items-center justify-content-center mx-auto"
          style={{ fontSize: '1.5rem', padding: '15px 30px' }}
          onClick={() => navigate(`/record-samples/${project.id}`)}
        >
          <i className="fas fa-microphone me-3"></i> Record New Samples
        </button>
      </div>

      {/* Search and Sort */}
      <div className="d-flex justify-content-between mb-4">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Search samples..."
          value={searchQuery}
          onChange={handleSearch}
          aria-label="Search samples"
        />
        <select
          className="form-select"
          value={sortOrder}
          onChange={handleSort}
          aria-label="Sort samples"
        >
          <option value="newest">Newest to Oldest</option>
          <option value="oldest">Oldest to Newest</option>
        </select>
      </div>

      <div className="row">
        {filteredSamples && filteredSamples.length > 0 ? (
          filteredSamples.map((sample) => (
            <SampleRow
              key={sample.id}
              sample={sample}
              onEdit={handleEditSample}
              onThumbsChange={handleThumbsChange}
              onDelete={handleDeleteSample}
            />
          ))
        ) : (
          <p>No samples available for this project.</p>
        )}
      </div>

      {showProjectModal && (
        <ProjectModal
          showModal={showProjectModal}
          closeModal={() => setShowProjectModal(false)}
          onSave={(updatedProject) => {
            window.electronAPI.updateProject({ ...updatedProject, id: project.id }).then(() => {
              setProject(updatedProject);
              setShowProjectModal(false);
            });
          }}
          editingProject={project}
        />
      )}

      {editingSample && (
        <SampleModal
          showModal={!!editingSample}
          closeModal={() => setEditingSample(null)}
          onSave={(updatedSample) => {
            const updatedSamples = project.samples.map((s) =>
              s.id === updatedSample.id ? updatedSample : s
            );
            setProject({ ...project, samples: updatedSamples });
            setFilteredSamples(updatedSamples);
            setEditingSample(null);
          }}
          onDelete={handleDeleteSample}
          editingSample={editingSample}
        />
      )}
    </div>
  );
};

export default ProjectPage;
