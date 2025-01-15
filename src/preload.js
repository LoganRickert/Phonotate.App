const { contextBridge, ipcRenderer } = require('electron');

// Expose the necessary functions to the renderer process via contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  getProjects: () => ipcRenderer.invoke('get-projects'),
  createProject: (project) => ipcRenderer.invoke('create-project', project),
  updateProject: (project) => ipcRenderer.invoke('update-project', project),
  deleteProject: (projectId) => ipcRenderer.invoke('delete-project', projectId),
  createSample: (sample) => ipcRenderer.invoke('create-sample', sample),
  deleteSample: (sample) => ipcRenderer.invoke('delete-sample', sample),
  getSamples: (projectId) => ipcRenderer.invoke('get-samples', projectId),
  getProject: (projectId) => ipcRenderer.invoke('get-project', projectId),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  saveFile: (filePath, fileData) => ipcRenderer.invoke('save-file', filePath, fileData),
  addSample: (sample) => ipcRenderer.invoke('add-sample', sample),
  updateSample: (sample) => ipcRenderer.invoke('update-sample', sample),
});
