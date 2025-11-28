import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ResetPassword from "../../components/ResetPassword";
import axios from "axios";

jest.mock("axios");

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: () => [
      new URLSearchParams({ token: "testtoken" })
    ],
  };
});

describe("ResetPassword Component", () => {
  const clickResetButton = () => {
    fireEvent.click(screen.getAllByText("Reset Password")[1]); // Use the BUTTON, not the heading
  };

  test("renders fields and button", () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText("Enter new password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm new password")).toBeInTheDocument();
  });

  test("shows mismatch error", async () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter new password"), {
      target: { value: "abc123" },
    });

    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "wrong" },
    });

    clickResetButton();

    await waitFor(() => {
      expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
    });
  });

  test("shows success message", async () => {
    axios.post.mockResolvedValue({ data: "Password reset successful" });

    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter new password"), {
      target: { value: "newpass" },
    });

    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "newpass" },
    });

    clickResetButton();

    await waitFor(() => {
      expect(screen.getByText("Password reset successful")).toBeInTheDocument();
    });
  });

  test("shows API error", async () => {
    axios.post.mockRejectedValue({
      response: { data: "Invalid token" },
    });

    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter new password"), {
      target: { value: "newpass" },
    });

    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "newpass" },
    });

    clickResetButton();

    await waitFor(() => {
      expect(screen.getByText("Invalid token")).toBeInTheDocument();
    });
  });

  test("shows fallback error", async () => {
    axios.post.mockRejectedValue({});

    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter new password"), {
      target: { value: "newpass" },
    });

    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "newpass" },
    });

    clickResetButton();

    await waitFor(() => {
      expect(screen.getByText("Failed to reset password")).toBeInTheDocument();
    });
  });
});
