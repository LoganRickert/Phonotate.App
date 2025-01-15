import React, { useState, useEffect } from 'react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    language: 'en', // Default language
    chatgptApiUrl: '',
    chatgptToken: '',
    model: '',
    asrServiceUrl: '', // Whisper ASR service URL
    phonemizationUrl: 'http://localhost:8000', // Default phonemization URL
    openaiWhisperUrl: '', // OpenAI Whisper URL,
    openaiToken: ''
  });

  useEffect(() => {
    window.electronAPI.getSettings().then((fetchedSettings) => {
      setSettings({
        language: fetchedSettings.language || 'en', // Default to English
        chatgptApiUrl: fetchedSettings.chatgptApiUrl || '',
        chatgptToken: fetchedSettings.chatgptToken || '',
        model: fetchedSettings.model || '',
        asrServiceUrl: fetchedSettings.asrServiceUrl || '',
        phonemizationUrl: fetchedSettings.phonemizationUrl || '',
        openaiWhisperUrl: fetchedSettings.openaiWhisperUrl || '', // Load OpenAI Whisper URL
        openaiToken: fetchedSettings.openaiWhisperToken || '',
    });
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    window.electronAPI.updateSettings(settings).then(() => {
      alert('Settings saved successfully!');
    });
  };

  return (
    <div className="container">
      <h1>Global Settings</h1>

      {/* Language Selection */}
      <div className="mb-4">
        <label htmlFor="language" className="form-label">
          Language
        </label>
        <select
          className="form-select"
          id="language"
          name="language"
          value={settings.language}
          onChange={handleChange}
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
      </div>

      {/* ChatGPT API URL */}
      <div className="mb-4">
        <label htmlFor="chatgptApiUrl" className="form-label">
          ChatGPT API URL
        </label>
        <input
          type="text"
          className="form-control"
          id="chatgptApiUrl"
          name="chatgptApiUrl"
          value={settings.chatgptApiUrl}
          onChange={handleChange}
          placeholder="http://localhost:3000/api/chat/completions"
        />
      </div>

      {/* ChatGPT Token */}
      <div className="mb-4">
        <label htmlFor="chatgptToken" className="form-label">
          ChatGPT Token
        </label>
        <input
          type="text"
          className="form-control"
          id="chatgptToken"
          name="chatgptToken"
          value={settings.chatgptToken}
          onChange={handleChange}
          placeholder="sk-"
        />
      </div>

      {/* Model */}
      <div className="mb-4">
        <label htmlFor="model" className="form-label">
          Model
        </label>
        <input
          type="text"
          className="form-control"
          id="model"
          name="model"
          value={settings.model}
          onChange={handleChange}
          placeholder="e.g., gpt-3.5-turbo"
        />
      </div>

      {/* ASR Service URL */}
      <div className="mb-4">
        <label htmlFor="asrServiceUrl" className="form-label">
          ASR Service URL
        </label>
        <input
          type="text"
          className="form-control"
          id="asrServiceUrl"
          name="asrServiceUrl"
          value={settings.asrServiceUrl}
          onChange={handleChange}
          placeholder="http://localhost:5000/asr"
        />
      </div>

      {/* OpenAI Whisper URL */}
      <div className="mb-4">
        <label htmlFor="openaiWhisperUrl" className="form-label">
          OpenAI Whisper URL
        </label>
        <input
          type="text"
          className="form-control"
          id="openaiWhisperUrl"
          name="openaiWhisperUrl"
          value={settings.openaiWhisperUrl}
          onChange={handleChange}
          placeholder="https://api.openai.com/v1/audio/transcriptions"
        />
      </div>

      {/* OpenAI Whisper URL */}
      <div className="mb-4">
        <label htmlFor="openaiWhisperToken" className="form-label">
          OpenAI Whisper Token
        </label>
        <input
          type="text"
          className="form-control"
          id="openaiWhisperToken"
          name="openaiWhisperToken"
          value={settings.openaiWhisperToken}
          onChange={handleChange}
          placeholder="sk-"
        />
      </div>

      {/* Phonemization Service URL */}
      <div className="mb-4">
        <label htmlFor="phonemizationUrl" className="form-label">
          Phonemization Service URL
        </label>
        <input
          type="text"
          className="form-control"
          id="phonemizationUrl"
          name="phonemizationUrl"
          value={settings.phonemizationUrl}
          onChange={handleChange}
          placeholder="http://localhost:8000"
        />
      </div>

      {/* Save Button */}
      <button className="btn btn-primary" onClick={handleSave}>
        Save Settings
      </button>
    </div>
  );
};

export default SettingsPage;
