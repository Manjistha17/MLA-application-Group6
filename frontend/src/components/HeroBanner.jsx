import { Alert, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/components/HeroBanner.css";

const HeroBanner = ({ onLogin }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        const { role, username: responseUsername, email } = response.data;
        localStorage.setItem("role", role);
        localStorage.setItem("username", responseUsername);
        localStorage.setItem("email", email);
        onLogin(responseUsername, role);
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSignIn();
  };

  return (
    <div className="loginPage">
      <div className="loginCard">

        {/* LEFT — FORM */}
        <div className="loginFormSide">
          <div className="loginLogo">
            <img src="/logo.png" alt="Shakti 360 logo" className="loginLogoImg" />
            <Typography component="span" sx={{ fontWeight: 800, color: "#111827" }}>Shakti°</Typography>
            <Typography component="span" sx={{ fontWeight: 400, color: "#111827" }}>360</Typography>
          </div>

          <div className="loginHeadingGroup">
            <h1 className="loginHeading">Welcome back.<br />Let's keep moving.</h1>
            <p className="loginSubheading">Sign in to track your progress and crush today's goals.</p>
          </div>

          {error && (
            <Alert severity="error" sx={{ borderRadius: "10px", fontSize: "14px", mb: 1 }}>
              {error}
            </Alert>
          )}

          <div className="loginFields">
            <div className="loginFieldGroup">
              <label className="loginLabel">Username</label>
              <input
                ref={usernameRef}
                className="loginInput"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="username"
              />
            </div>

            <div className="loginFieldGroup">
              <label className="loginLabel">Password</label>
              <input
                className="loginInput"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
              />
            </div>

            <button
              className="loginSignInBtn"
              onClick={handleSignIn}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <div className="loginBottomLinks">
            <button className="loginLinkBtn" onClick={() => navigate("/ForgotPassword")}>
              Forgot password?
            </button>
            <span className="loginNewHere">
              New here?{" "}
              <button className="loginLinkBtnPrimary" onClick={() => navigate("/signup")}>
                Get Started
              </button>
            </span>
          </div>
        </div>

        {/* RIGHT — ILLUSTRATION */}
        <div className="loginIllustrationSide">
          <div className="loginRing loginRing1" />
          <div className="loginRing loginRing2" />
          <div className="loginRing loginRing3" />

          <img
            src="/login-Illustration.png"
            alt="Fitness illustration"
            className="loginIllustrationImg"
          />

          <div className="loginIllustrationCaption">
            <h2>Build a stronger, healthier you</h2>
            <p>Track workouts, monitor nutrition, and stay consistent every single day.</p>
            <div className="loginPills">
              <span className="loginPill loginPillActive">🔥 Workout Tracking</span>
              <span className="loginPill">💧 Hydration</span>
              <span className="loginPill">📈 Progress</span>
              <span className="loginPill loginPillActive">🥗 Nutrition</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroBanner;