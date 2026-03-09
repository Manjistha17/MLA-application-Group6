import React, { useState } from "react";
import { Container, Card, Alert, Button, Spinner } from "react-bootstrap";
import axios from "axios";

const ResendVerification = () => {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    setStatus("loading");
    setMessage("");

    try {
      const res = await axios.post("https://d393qv373r18to.cloudfront.net/api/auth/resend-verification");
      setStatus("success");
      setMessage(
        res.data?.message || "Verification email sent successfully. Please check your inbox."
      );
    } catch (err) {
      setStatus("error");
      setMessage(
        err.response?.data?.message || "Failed to send verification email. Please try again."
      );
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4" style={{ maxWidth: "420px", width: "100%" }}>
        <h4 className="text-center mb-3">Resend Email Verification</h4>

        <p className="text-muted text-center">
          Your email is not verified. Click the button below to resend the verification link.
        </p>

        {status === "success" && (
          <Alert variant="success" className="mt-3">
            {message}
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="danger" className="mt-3">
            {message}
          </Alert>
        )}

        <Button
          variant="primary"
          onClick={handleResend}
          disabled={status === "loading" || status === "success"}
          className="mt-3 w-100"
        >
          {status === "loading" ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                className="me-2"
              />
              Sending…
            </>
          ) : (
            "Resend Verification Email"
          )}
        </Button>
      </Card>
    </Container>
  );
};

export default ResendVerification;
