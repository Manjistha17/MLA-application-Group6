import React, { useState, useRef, useEffect } from "react";
import { Button, Form, Alert, Card, Container, Spinner } from "react-bootstrap";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Accessibility: Ref to set initial focus for keyboard users
  const usernameInputRef = useRef(null);

  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (error) {
      const errorAlert = document.getElementById("login-error-alert");
      if (errorAlert) {
        errorAlert.focus();
      }
    }
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "/api/auth/login",
        { username, password },
        { withCredentials: true } // ✅ ensure session cookie is sent
      );

      if (response.status === 200) {
        const { role, username: responseUsername, email } = response.data;

        // Save role and username in localStorage
        localStorage.setItem("role", role);
        localStorage.setItem("username", responseUsername);
        localStorage.setItem("email", email);

        // Pass role to parent if needed
        onLogin(responseUsername, role);

        // Navigate after saving
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
    <Container
      fluid
      className="d-flex flex-column justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: "url('/login_box.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <h1
        className="text-center mb-3"
        style={{
          color: "#efeff1ff",
          fontWeight: "700",
          textShadow: "0px 2px 6px rgba(192, 36, 127, 0.69)",
        }}
      >
        Welcome to the MLA Fitness App!
      </h1>

      <Card
        className="p-4 shadow-sm"
        style={{
          maxWidth: "400px",
          width: "100%",
          borderRadius: "10px",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
        }}
      >
        {error && (
          <Alert
            variant="danger"
            role="alert"
            tabIndex="-1"
            id="login-error-alert"
          >
            {error}
          </Alert>
        )}

        <Form onSubmit={handleLogin} noValidate>
          <Form.Group controlId="formUsername" className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              ref={usernameInputRef}
              aria-required="true"
              autoComplete="username"
            />
          </Form.Group>

          <Form.Group controlId="formPassword" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
              autoComplete="current-password"
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 mt-2"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>

          <p className="text-center mt-2 mb-0">
            <Link to="/forgotPassword">Forgot Password?</Link>
          </p>
        </Form>

        <p className="text-center mt-3 mb-0">
          New user? <Link to="/signup">Sign up here</Link>
        </p>
      </Card>
    </Container>
  );
};

export default Login;