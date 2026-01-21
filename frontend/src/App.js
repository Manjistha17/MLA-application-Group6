import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
//import './App.css';
//import 'bootstrap/dist/css/bootstrap.min.css';

//import NavbarComponent from './components/navbar';
import TrackExercise from './components/trackExercise';
import Statistics from './components/statistics';
import Footer from './components/footer';
//import Login from './components/login';
import Signup from './components/signup';
import Journal from './components/journal';
//import logo from './img/CFG_logo.png';
import DailyStats from './components/DailyStats';
//import Profile from './components/Profile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import EditProfile from './components/EditProfile';
import Dashboard from './components/Dashboard';
import PublicLayout from './components/layout/PublicLayout';
import HeroBanner from './components/HeroBanner';
import AppHeader from './components/layout/AppHeader';
import Profile from './components/UserProfile'


function App() {

  // -----------------------------------------
  // Load login state from localStorage
  // -----------------------------------------
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("currentUser") || ""
  );

  // Restore login on refresh
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const storedUser = localStorage.getItem("currentUser");
    const storedLogin = localStorage.getItem("isLoggedIn") === "true";

    if (storedUser && storedLogin) {
      setCurrentUser(storedUser);
      setIsLoggedIn(true);
    }
  }, []);

  // -----------------------------------------
  // LOGOUT
  // -----------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");

    setIsLoggedIn(false);
    setCurrentUser('');
  };

  // -----------------------------------------
  // LOGIN
  // -----------------------------------------
  const handleLogin = (username) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUser", username);

    setIsLoggedIn(true);
    setCurrentUser(username);
  };

  return (
    <div className="App">
      <Router>

        {/* <div className="appTitle">
          <h1>MLA Fitness App</h1>
          <img src={logo} alt="CFG Fitness App Logo" id="appLogo" />
        </div> */}

        {isLoggedIn && <AppHeader
          currentUser={currentUser}
          onLogout={handleLogout}
        />}

        <div className="componentContainer">
          <Routes>

            {/* Public Routes */}
            <Route
              path="/login"
              element={
                isLoggedIn ? <Navigate to="/dashboard" /> : <PublicLayout>
                  <HeroBanner onLogin={handleLogin} />
                </PublicLayout>
              }
            />

            <Route
              path="/signup"
              element={
                isLoggedIn ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Signup onSignup={handleLogin} />
                )
              }
            />

            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route path="/resetPassword" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                isLoggedIn ? (
                  <Dashboard currentUser={currentUser} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/profile"
              element={
                isLoggedIn ? (
                  <Profile currentUser={currentUser} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/edit-profile"
              element={
                isLoggedIn ? (
                  <EditProfile currentUser={currentUser} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/trackExercise"
              element={
                isLoggedIn ? (
                  <TrackExercise currentUser={currentUser} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/statistics"
              element={
                isLoggedIn ? (
                  <Statistics currentUser={currentUser} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/journal"
              element={
                isLoggedIn ? (
                  <Journal currentUser={currentUser} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/dailystats"
              element={
                isLoggedIn ? (
                  <DailyStats currentUser={currentUser} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Default Route */}
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

          </Routes>
        </div>

        <Footer />

      </Router>
    </div>
  );
}

export default App;