import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Find the root element in the DOM
const rootElement = document.getElementById('root');

// Use createRoot for rendering
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
