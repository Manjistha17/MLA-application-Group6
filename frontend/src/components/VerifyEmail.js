import React, { useEffect, useState } from "react";
import { Container, Card, Alert, Spinner, Button } from "react-bootstrap";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const response = await axios.get(
          `/api/auth/verify-email?token=${token}`
        );
        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Verification failed. Token may be expired."
        );
      }
    };

    verify();
  }, [token]);

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4 shadow" style={{ maxWidth: "420px", width: "100%" }}>
        <h3 className="text-center mb-4">Email Verification</h3>

        {status === "loading" && (
          <div className="text-center">
            <Spinner animation="border" />
            <p className="mt-3">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <>
            <Alert variant="success" className="text-center">
              ✅ {message}
            </Alert>
            <div className="d-grid">
              <Button variant="success" onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            </div>
          </>
        )}

        {status === "error" && (
          <Alert variant="danger" className="text-center">
            ❌ {message}
          </Alert>
        )}
      </Card>
    </Container>
  );
};

export default VerifyEmail;
