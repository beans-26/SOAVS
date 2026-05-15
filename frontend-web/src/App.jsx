import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminElections from './pages/AdminElections';
import AdminCandidates from './pages/AdminCandidates';
import AdminPartylists from './pages/AdminPartylists';
import AdminUsers from './pages/AdminUsers';
import VoterDashboard from './pages/VoterDashboard';
import Ballot from './pages/Ballot';
import Success from './pages/Success';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/elections" element={<AdminElections />} />
          <Route path="/admin/candidates" element={<AdminCandidates />} />
          <Route path="/admin/partylists" element={<AdminPartylists />} />
          <Route path="/admin/users" element={<AdminUsers />} />

          <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/voter-dashboard" element={<Navigate to="/voter/dashboard" />} />
          
          <Route path="/voter/dashboard" element={<VoterDashboard />} />
          <Route path="/voter/ballot/:id" element={<Ballot />} />
          <Route path="/voter/success" element={<Success />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
