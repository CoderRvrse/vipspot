import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './firebaseConfig'; // Ensure Firebase initialization is imported before App is rendered

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Measure performance
reportWebVitals(console.log); // You can remove or customize the callback
