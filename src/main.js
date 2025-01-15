const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

console.log("Is Dev", !app.isPackaged);

const db = require('./database');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

let mainWindow;

app.on('ready', () => {

  const preloadPath = isDev
  ? path.join(__dirname, 'preload.js') // When in development
  : path.join(process.resourcesPath, 'app', 'src', 'preload.js'); // When packaged

  console.log("Preload path:", preloadPath);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media' || permission === 'microphone') {
      console.log('Microphone permission granted');
      callback(true); // Approve permission
    } else {
      console.log('Permission denied:', permission);
      callback(false); // Deny other permissions
    }
  });

  const htmlPath = isDev
  ? path.join(__dirname, '../index.html') // When in development
  : path.join(process.resourcesPath, 'app', 'index.html'); // When packaged

  mainWindow.loadFile(htmlPath);

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on('window-all-closed', () => {
  // Quit the app when all windows are closed (except on macOS)
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  // Recreate the window if it was closed (macOS behavior)
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('web-contents-created', (event, contents) => {
  contents.on('console-message', (event, level, message) => {
    if (message.includes("Autofill")) {
      return; // Suppress Autofill-related errors
    }
  });
});

ipcMain.handle('dialog:selectFolder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  return result.filePaths[0]; // Return the selected folder path
});

ipcMain.handle('save-file', async (event, filePath, fileData) => {
  try {
    const buffer = Buffer.from(fileData);
    await fs.promises.writeFile(filePath, buffer);
    console.log(`File saved to ${filePath}`);
    return { success: true };
  } catch (error) {
    console.error(`Error saving file to ${filePath}:`, error);
    throw error;
  }
});

// Get all projects with samples
ipcMain.handle('get-projects', async () => {
  const stmt = db.prepare('SELECT * FROM projects ORDER BY date_created DESC');
  const projects = stmt.all();

  // Fetch samples for each project
  for (let project of projects) {
    const samplesStmt = db.prepare('SELECT * FROM samples WHERE project_id = ?');
    const samples = samplesStmt.all(project.id);
    project.samples = samples;
  }

  return projects;
});

// Create a new project
ipcMain.handle('create-project', async (event, project) => {
  const projectId = uuidv4();

  try {
    const stmt = db.prepare(`
      INSERT INTO projects (
        id,
        name,
        voice_actor,
        emotion,
        description,
        author_id,
        storage_type,
        storage_path,
        s3_url,
        s3_bucket,
        s3_root_folder,
        s3_key,
        date_created
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const dateCreated = new Date().toISOString();

    stmt.run(
      projectId,
      project.name,
      project.voice_actor,
      project.emotion || '',
      project.description || '',
      project.author_id || '0',
      project.storage_type || 'Local',
      project.storage_path || '',
      project.s3_url || '',
      project.s3_bucket || '',
      project.s3_root_folder || '',
      project.s3_key || '',
      dateCreated
    );

    console.log('Project created:', project);
    return { success: true };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
});

// Create a new sample for a project
ipcMain.handle('create-sample', async (event, sample) => {
  const sampleId = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO samples (id, project_id, rating, file_path, length_seconds, size_bytes, text_said, ground_truth, date_recorded)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(sampleId, sample.project_id, sample.rating, sample.file_path, sample.length_seconds, sample.size_bytes, sample.text_said, sample.ground_truth, new Date().toISOString());
});

// Delete a project
ipcMain.handle('delete-project', async (event, projectId) => {
  const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
  stmt.run(projectId);

  // Also delete the related samples
  const sampleStmt = db.prepare('DELETE FROM samples WHERE project_id = ?');
  sampleStmt.run(projectId);
});

// Get samples for a project
ipcMain.handle('get-samples', async (event, projectId) => {
  const stmt = db.prepare('SELECT * FROM samples WHERE project_id = ?');
  return stmt.all(projectId);
});

// Update an existing project
ipcMain.handle('update-project', async (event, project) => {
  try {
    const stmt = db.prepare(`
      UPDATE projects
      SET
        name = ?,
        voice_actor = ?,
        emotion = ?,
        description = ?,
        author_id = ?,
        storage_type = ?,
        storage_path = ?,
        s3_url = ?,
        s3_bucket = ?,
        s3_root_folder = ?,
        s3_key = ?
      WHERE id = ?
    `);

    stmt.run(
      project.name,
      project.voice_actor,
      project.emotion || '',
      project.description || '',
      project.author_id || '0',
      project.storage_type || 'Local',
      project.storage_path || '',
      project.s3_url || '',
      project.s3_bucket || '',
      project.s3_root_folder || '',
      project.s3_key || '',
      project.id
    );

    console.log('Project updated:', project);
    return { success: true };
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
});

ipcMain.handle('get-project', async (event, projectId) => {
  try {
    const projectStmt = db.prepare(`
      SELECT * FROM projects WHERE id = ?
    `);
    const project = projectStmt.get(projectId);

    if (project) {
      const samplesStmt = db.prepare(`
        SELECT * FROM samples WHERE project_id = ?
      `);
      project.samples = samplesStmt.all(projectId); // Attach samples to the project
    }

    return project;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
});

ipcMain.handle('get-settings', async () => {
  const stmt = db.prepare('SELECT * FROM settings');
  const rows = stmt.all();
  const settings = {};
  rows.forEach((row) => {
    settings[row.key] = row.value;
  });
  return settings;
});

ipcMain.handle('update-settings', async (event, settings) => {
  const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?');

  for (const key in settings) {
    stmt.run(key, settings[key], settings[key]);
  }

  return { success: true };
});

ipcMain.handle('add-sample', async (event, sample) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO samples (
        id,
        project_id,
        rating,
        file_path,
        file_path24,
        length_seconds,
        size_bytes,
        text_said,
        ground_truth,
        date_recorded,
        waveform_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      sample.id,
      sample.project_id,
      sample.match ? 1 : 0, // Rating based on match (1 = good, 0 = bad)
      sample.file_path,
      sample.file_path24,
      sample.recording_length,
      sample.size_bytes,
      sample.text_said,
      sample.ground_truth,
      new Date().toISOString(), // Current timestamp in ISO 8601 format
      sample.waveform_path
    );

    console.log('Sample added:', sample);
    return { success: true };
  } catch (error) {
    console.error('Error adding sample:', error);
    throw error;
  }
});

ipcMain.handle('update-sample', async (event, sample) => {
  try {
    const stmt = db.prepare(`
      UPDATE samples
      SET
        rating = ?,
        file_path = ?,
        file_path24 = ?,
        size_bytes = ?,
        text_said = ?,
        ground_truth = ?,
        waveform_path = ?
      WHERE id = ?
    `);

    const info = stmt.run(
      sample.rating,
      sample.file_path,
      sample.file_path24,
      sample.size_bytes,
      sample.text_said,
      sample.ground_truth,
      sample.waveform_path,
      sample.id // Identify the sample to update by ID
    );

    if (info.changes === 0) {
      throw new Error(`No row found with id: ${sample.id}`);
    }

    console.log(info);

    console.log('Sample updated:', sample);
    return { success: true };
  } catch (error) {
    console.error('Error updating sample:', error);
    throw error;
  }
});

ipcMain.handle('delete-sample', async (event, sampleId) => {
  try {
    const stmt = db.prepare('DELETE FROM samples WHERE id = ?');
    const info = stmt.run(sampleId);

    if (info.changes === 0) {
      throw new Error(`No sample found with id: ${sampleId}`);
    }

    console.log(`Sample with id ${sampleId} deleted.`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting sample:', error.message);
    throw error;
  }
});
