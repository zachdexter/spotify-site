import './App.css';

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CallbackPage from './pages/CallbackPage';
const App = () => {
  const isLoggedIn = () => {
    const token = localStorage.getItem('accessToken');
    return token !== null; //returns true if token exists
  }
  return (
    <Router> 
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn() ? <Navigate to="/home" replace /> : <LoginPage />
          }
          />
        <Route path="/home" element={<HomePage />} />
        <Route path="/callback" element={<CallbackPage />} />
      </Routes>
    </Router>
  )
}

export default App;
