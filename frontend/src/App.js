import './App.css';

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CallbackPage from './pages/CallbackPage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Landing page route → shows the login button */}
        <Route path="/" element={<LoginPage />} />

        {/* After successful Spotify auth & callback → you land on /home with token */}
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;
