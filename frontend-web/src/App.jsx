import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminElections from './pages/AdminElections';
import AdminCandidates from './pages/AdminCandidates';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/admin/elections" element={<AdminElections />} />
          <Route path="/admin/candidates" element={<AdminCandidates />} />
          
          <Route path="/admin-dashboard" element={<Navigate to="/admin/elections" />} />
          <Route path="/voter-dashboard" element={<div className="fade-in"><h1>Voter Dashboard</h1></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
