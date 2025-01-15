import React from 'react';
import { HashRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import ProjectsPage from './components/ProjectsPage';
import SettingsPage from './components/SettingsPage';
import ProjectPage from './components/ProjectPage';
import CreateSamplePage from './components/CreateSamplePage';
import HelpPage from './components/HelpPage';

const App = () => (
  <Router>
    {/* Navigation Bar */}
    <nav
      className="navbar navbar-dark bg-dark"
      aria-label="Main Navigation"
      role="navigation"
    >
      <div className="container-fluid">
        <span className="navbar-brand" aria-label="Phonotate Home">Phonotate.App</span>
        <ul
          className="navbar-nav d-flex flex-row"
          role="menubar"
          aria-label="Navigation Menu"
        >
          <li className="nav-item mx-2" role="none">
            <NavLink
              className="nav-link text-light"
              to="/"
              title="Projects"
              role="menuitem"
              aria-label="Go to Projects Page"
            >
              <i className="fas fa-folder-open"></i>
              <span className="visually-hidden">Projects</span>
            </NavLink>
          </li>
          <li className="nav-item mx-2" role="none">
            <NavLink
              className="nav-link text-light"
              to="/help"
              title="Help"
              role="menuitem"
              aria-label="Go to Help Page"
            >
              <i className="fas fa-question-circle"></i>
              <span className="visually-hidden">Help</span>
            </NavLink>
          </li>
          <li className="nav-item mx-2" role="none">
            <NavLink
              className="nav-link text-light"
              to="/settings"
              title="Settings"
              role="menuitem"
              aria-label="Go to Settings Page"
            >
              <i className="fas fa-cog"></i>
              <span className="visually-hidden">Settings</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>

    {/* Page Routes */}
    <main className="container mt-4 text-light" role="main">
      <Routes>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/project/:id" element={<ProjectPage />} />
        <Route path="/create-sample" element={<CreateSamplePage />} />
        <Route path="/record-samples/:id" element={<CreateSamplePage />} />
      </Routes>
    </main>
  </Router>
);

export default App;
