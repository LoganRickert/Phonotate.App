import React, { useState, useEffect } from 'react';

const ProjectModal = ({ showModal, closeModal, onSave, editingProject }) => {
  const [name, setName] = useState('');
  const [voiceActor, setVoiceActor] = useState('');
  const [emotion, setEmotion] = useState('');
  const [description, setDescription] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [storageType, setStorageType] = useState('Local'); // Default to "Local"
  const [storagePath, setStoragePath] = useState('');
  const [s3Url, setS3Url] = useState('');
  const [s3Bucket, setS3Bucket] = useState('');
  const [s3RootFolder, setS3RootFolder] = useState('');
  const [s3Key, setS3Key] = useState('');

  // Reset modal fields when editing a project
  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setVoiceActor(editingProject.voice_actor);
      setEmotion(editingProject.emotion);
      setDescription(editingProject.description);
      setAuthorId(editingProject.author_id);
      setStorageType(editingProject.storage_type || 'Local');
      setStoragePath(editingProject.storage_path || '');
      setS3Url(editingProject.s3_url || '');
      setS3Bucket(editingProject.s3_bucket || '');
      setS3RootFolder(editingProject.s3_root_folder || '');
      setS3Key(editingProject.s3_key || '');
    } else {
      setName('');
      setVoiceActor('');
      setEmotion('');
      setDescription('');
      setAuthorId('');
      setStorageType('Local');
      setStoragePath('');
      setS3Url('');
      setS3Bucket('');
      setS3RootFolder('');
      setS3Key('');
    }
  }, [editingProject]);

  const handleFolderSelect = async () => {
    const folderPath = await window.electronAPI.selectFolder();
    if (folderPath) {
      setStoragePath(folderPath);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && voiceActor) {
      onSave({
        name,
        voice_actor: voiceActor,
        emotion,
        description,
        author_id: authorId,
        storage_type: storageType,
        storage_path: storageType === 'Local' ? storagePath : '',
        s3_url: storageType === 'Cloud' ? s3Url : '',
        s3_bucket: storageType === 'Cloud' ? s3Bucket : '',
        s3_root_folder: storageType === 'Cloud' ? s3RootFolder : '',
        s3_key: storageType === 'Cloud' ? s3Key : '',
      });
      closeModal();
    } else {
      alert('Please fill in the project name and voice actor');
    }
  };

  if (!showModal) return null;

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{editingProject ? 'Edit Project' : 'Create Project'}</h5>
            <button type="button" className="close" onClick={closeModal} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Project Name</label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="voiceActor">Voice Actor</label>
                <input
                  type="text"
                  id="voiceActor"
                  className="form-control"
                  value={voiceActor}
                  onChange={(e) => setVoiceActor(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="emotion">Emotion/Style</label>
                <input
                  type="text"
                  id="emotion"
                  className="form-control"
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="authorId">Author ID</label>
                <input
                  type="number"
                  id="authorId"
                  className="form-control"
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="storageType">Storage Type</label>
                <select
                  id="storageType"
                  className="form-control"
                  value={storageType}
                  onChange={(e) => setStorageType(e.target.value)}
                >
                  <option value="Local">Local</option>
                  <option value="Cloud">Cloud</option>
                </select>
              </div>
              {storageType === 'Local' && (
                <div className="form-group">
                  <label htmlFor="storagePath">Storage Path</label>
                  <div className="input-group">
                    <input
                      type="text"
                      id="storagePath"
                      className="form-control"
                      value={storagePath}
                      readOnly
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleFolderSelect}
                    >
                      Browse...
                    </button>
                  </div>
                </div>
              )}
              {storageType === 'Cloud' && (
                <>
                  <div className="form-group">
                    <label htmlFor="s3Url">S3 URL</label>
                    <input
                      type="text"
                      id="s3Url"
                      className="form-control"
                      value={s3Url}
                      onChange={(e) => setS3Url(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="s3Bucket">S3 Bucket</label>
                    <input
                      type="text"
                      id="s3Bucket"
                      className="form-control"
                      value={s3Bucket}
                      onChange={(e) => setS3Bucket(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="s3RootFolder">S3 Root Folder</label>
                    <input
                      type="text"
                      id="s3RootFolder"
                      className="form-control"
                      value={s3RootFolder}
                      onChange={(e) => setS3RootFolder(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="s3Key">S3 Bucket Key</label>
                    <input
                      type="text"
                      id="s3Key"
                      className="form-control"
                      value={s3Key}
                      onChange={(e) => setS3Key(e.target.value)}
                    />
                  </div>
                </>
              )}
              <button type="submit" className="btn btn-primary mt-3">
                {editingProject ? 'Update Project' : 'Create Project'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
