import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { FileProvider } from './context/FileContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <FileProvider>
        <Router>
          <App />
          <ToastContainer position="top-right" autoClose={3000} />
        </Router>
      </FileProvider>
    </AuthProvider>
  </React.StrictMode>
);
