import React, { useState, useEffect, useRef } from "react";
import { TextField, Button, Alert } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "../styles/components/HeroBanner.css";

const HeroBanner = ({ onLogin }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Accessibility: focus username on load
  const usernameRef = useRef(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleSignIn = async () => {
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/auth/login", {
        username,
        password,
      });

      if (response.status === 200) {
        onLogin(username);
        navigate("/dashboard");
      } else {
        setError("Invalid credentials.");
      }
    } catch (err) {
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Failed to login. Please check your credentials.";

      setError(
        typeof serverMessage === "string"
          ? serverMessage
          : "Login error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="heroBanner">
      <div className="heroLeft">
        <h1 className="heroTitle">Build a stronger, healthier you</h1>
        <p className="heroSubtitle">
          Track workouts, monitor progress, and stay consistent.
        </p>

        <div className="loginForm">
          {error && (
            <Alert
              severity="error"
              className="loginError"
              role="alert"
            >
              {error}
            </Alert>
          )}

          <label className="formLabel">Username</label>
          <TextField
            inputRef={usernameRef}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
            fullWidth
            autoComplete="username"
          />

          <label className="formLabel">Password</label>
          <TextField
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            fullWidth
            autoComplete="current-password"
          />
          <br/>
          <Button
            variant="contained"
            fullWidth
            size="large"
            className="loginPrimaryButton"
            onClick={handleSignIn}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </div>

        <div className="signupCTA">
          <span>New here?</span>
          <button
            className="getStartedBtn"
            onClick={() => navigate("/signup")}
          >
            Get Started
          </button>
        </div>
      </div>

      <div className="heroRight">
        <div className="illustrationPlaceholder" />
      </div>
    </section>
  );
};

export default HeroBanner;