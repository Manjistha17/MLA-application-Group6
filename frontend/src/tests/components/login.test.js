import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../../components/login";
import axios from "axios";

jest.mock("axios");

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login Component", () => {
  test("renders login fields", () => {
    render(
      <MemoryRouter>
        <Login onLogin={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText("Enter your username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  test("submits login successfully", async () => {
    axios.post.mockResolvedValue({ status: 200 });

    const mockOnLogin = jest.fn();

    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
      target: { value: "john" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith("john");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("shows error on failed login", async () => {
    axios.post.mockRejectedValue({});

    render(
      <MemoryRouter>
        <Login onLogin={() => {}} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
      target: { value: "wrong" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "wrong" },
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(
        screen.getByText("Failed to login. Please check your credentials.")
      ).toBeInTheDocument();
    });
  });
});
