import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Setup error handlers before importing App to avoid initialization issues
import { setupGlobalErrorHandlers } from './utils/errorReporter.js';
import App from './App';

// Setup global error handlers immediately
setupGlobalErrorHandlers();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
