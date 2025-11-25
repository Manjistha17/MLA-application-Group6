import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ForgotPassword from "../../components/ForgotPassword";
import axios from "axios";

jest.mock("axios");

describe("ForgotPassword Component", () => {
  test("renders form fields", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    expect(screen.getByText("Forgot Password")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your registered email")
    ).toBeInTheDocument();
    expect(screen.getByText("Send Reset Link")).toBeInTheDocument();
  });

  test("shows success message on successful reset request", async () => {
    axios.post.mockResolvedValue({
      data: { message: "Reset link sent successfully" },
    });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter your registered email"),
      { target: { value: "test@example.com" } }
    );

    fireEvent.click(screen.getByText("Send Reset Link"));

    await waitFor(() =>
      expect(
        screen.getByText("Reset link sent successfully")
      ).toBeInTheDocument()
    );
  });

  test("shows error message when API returns an error", async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: "Email not found" } },
    });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter your registered email"),
      { target: { value: "wrong@example.com" } }
    );

    fireEvent.click(screen.getByText("Send Reset Link"));

    await waitFor(() =>
      expect(screen.getByText("Email not found")).toBeInTheDocument()
    );
  });

  test("shows fallback error when no response message exists", async () => {
    axios.post.mockRejectedValue({});

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter your registered email"),
      { target: { value: "x@example.com" } }
    );

    fireEvent.click(screen.getByText("Send Reset Link"));

    await waitFor(() =>
      expect(
        screen.getByText("Failed to send reset link")
      ).toBeInTheDocument()
    );
  });
});
