import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import NavbarComponent from "../../components/navbar";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn()
}));

describe("NavbarComponent", () => {
  const mockNavigate = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    mockNavigate.mockClear();
    mockLogout.mockClear();
  });

  const renderNavbar = () =>
    render(
      <MemoryRouter>
        <NavbarComponent onLogout={mockLogout} />
      </MemoryRouter>
    );

  test("renders all navigation links", () => {
    renderNavbar();

    expect(screen.getByText("Track New Exercise")).toBeInTheDocument();
    expect(screen.getByText("Statistics")).toBeInTheDocument();
    expect(screen.getByText("Weekly Journal")).toBeInTheDocument();
    expect(screen.getByText("Daily Stats")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  test("navigates when Track New Exercise is clicked", () => {
    renderNavbar();
    fireEvent.click(screen.getByText("Track New Exercise"));
    expect(mockNavigate).toHaveBeenCalledWith("/trackExercise");
  });

  test("navigates when Statistics is clicked", () => {
    renderNavbar();
    fireEvent.click(screen.getByText("Statistics"));
    expect(mockNavigate).toHaveBeenCalledWith("/statistics");
  });

  test("navigates when Weekly Journal is clicked", () => {
    renderNavbar();
    fireEvent.click(screen.getByText("Weekly Journal"));
    expect(mockNavigate).toHaveBeenCalledWith("/journal");
  });

  test("navigates when Daily Stats is clicked", () => {
    renderNavbar();
    fireEvent.click(screen.getByText("Daily Stats"));
    expect(mockNavigate).toHaveBeenCalledWith("/dailystats");
  });

  test("logout button triggers onLogout", () => {
    renderNavbar();
    fireEvent.click(screen.getByText("Logout"));
    expect(mockLogout).toHaveBeenCalled();
  });
});
