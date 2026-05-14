import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Placeholder routes for now */}
          <Route path="/register" element={<div className="fade-in"><h1>Register Page Coming Soon</h1></div>} />
          <Route path="/admin-dashboard" element={<div className="fade-in"><h1>Admin Dashboard</h1></div>} />
          <Route path="/voter-dashboard" element={<div className="fade-in"><h1>Voter Dashboard</h1></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
