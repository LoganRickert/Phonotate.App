import React, { useState, useEffect } from 'react';
import ProjectModal from './ProjectModal'; // Import the modal
import ProjectRow from './ProjectRow'; // Import the new ProjectRow component

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');  // Default to newest first

  useEffect(() => {
    window.electronAPI.getProjects().then((projects) => {
      setProjects(projects);
      setFilteredProjects(projects);
    });
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.voice_actor.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query)
    );
    setFilteredProjects(filtered);
  };

  const handleSort = (e) => {
    const order = e.target.value;
    setSortOrder(order);

    const sortedProjects = [...filteredProjects].sort((a, b) => {
      const dateA = new Date(a.date_created);
      const dateB = new Date(b.date_created);

      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredProjects(sortedProjects);
  };

  const resetModal = () => {
    setEditingProject(null);
  };

  const saveProject = (project) => {
    if (editingProject) {
      window.electronAPI.updateProject({ ...project, id: editingProject.id }).then(() => {
        // Re-fetch the updated projects list
        window.electronAPI.getProjects().then((projects) => {
          setProjects(projects);
          setFilteredProjects(projects);
        });
      });
    } else {
      window.electronAPI.createProject(project).then(() => {
        // Re-fetch the updated projects list
        window.electronAPI.getProjects().then((projects) => {
          setProjects(projects);
          setFilteredProjects(projects);
        });
      });
    }

    setShowModal(false);
  };

  const editProject = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const deleteProject = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      window.electronAPI.deleteProject(id).then(() => {
        // Re-fetch the updated projects list
        window.electronAPI.getProjects().then((projects) => {
          setProjects(projects);
          setFilteredProjects(projects); // Make sure both states are updated
        });
      });
    }
  };

  return (
    <div className="container">
      <header className="d-flex justify-content-between align-items-center my-4">
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus me-2"></i>Create New Project
        </button>
      </header>

      {/* Search and Sort Filters */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={handleSearch}
          aria-label="Search projects"
        />
        <select className="form-select" value={sortOrder} onChange={handleSort} aria-label="Sort projects">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Projects grid */}
      <div className="row">
        {filteredProjects && filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onEdit={editProject}
              onDelete={deleteProject}
            />
          ))
        ) : (
          <p>No projects available</p>
        )}
      </div>

      {/* Modal for creating or editing a project */}
      <ProjectModal
        showModal={showModal}
        closeModal={() => { setShowModal(false); resetModal(); }}
        onSave={saveProject}
        editingProject={editingProject}
      />
    </div>
  );
};

export default ProjectsPage;
