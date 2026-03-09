// import React, { useEffect, useState } from "react";
import { Container, Card, Alert, Spinner, Button } from "react-bootstrap";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try {
        await axios.get(
          `https://d393qv373r18to.cloudfront.net/api/auth/verify-email?token=${encodeURIComponent(token)}`
        );

        setStatus("success");
        setMessage("Your email has been verified successfully!");
      } catch (err) {
        const data = err.response?.data;

        const backendMessage =
          data?.message?.[0] ||
          data?.message ||
          data?.error ||
          data?.msg ||
          "Verification failed. Token may be expired.";

        setStatus("error");
        setMessage(backendMessage);
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

        {status !== "loading" && message && (
          <Alert
            variant={status === "success" ? "success" : "danger"}
            className="text-center"
          >
            {status === "success" && "🎉 "}
            {status === "error" && "❌ "}
            {message}
          </Alert>
        )}

        {status === "success" && (
          <div className="d-grid mt-3">
            <Button variant="success" onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default VerifyEmail;
