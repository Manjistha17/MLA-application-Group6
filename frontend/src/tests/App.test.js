import { fireEvent, render, screen } from "@testing-library/react";
import App from "../App";

// Mock child components so tests don't depend on them
jest.mock("../components/navbar", () => () => <div>Mock Navbar</div>);
jest.mock("../components/footer", () => () => <div>Mock Footer</div>);
jest.mock("../components/Dashboard", () => ({ currentUser }) => (
  <div>Mock Dashboard {currentUser}</div>
));
jest.mock("../components/Profile", () => ({ currentUser }) => (
  <div>Mock Profile {currentUser}</div>
));
jest.mock("../components/login", () => ({ onLogin }) => (
  <button onClick={() => onLogin("john")}>Mock Login Button</button>
));
jest.mock("../components/signup", () => ({ onSignup }) => (
  <button onClick={() => onSignup("newuser")}>Mock Signup Button</button>
));
jest.mock("../components/ForgotPassword", () => () => (
  <div>Mock ForgotPassword</div>
));
jest.mock("../components/ResetPassword", () => () => (
  <div>Mock ResetPassword</div>
));


function renderWithRoute(route) {
  window.history.pushState({}, "", route);
  return render(<App />);
}

beforeEach(() => {
  localStorage.clear();
});

// ------------------------------
// Tests
// ------------------------------

test("renders login when user is logged out", () => {
  renderWithRoute("/login");
  expect(screen.getByText("Mock Login Button")).toBeInTheDocument();
});

test("login button logs in user and loads dashboard", () => {
  renderWithRoute("/login");

  fireEvent.click(screen.getByText("Mock Login Button"));

  expect(screen.getByText("Mock Dashboard john")).toBeInTheDocument();
  expect(localStorage.getItem("currentUser")).toBe("john");
  expect(localStorage.getItem("isLoggedIn")).toBe("true");
});

test("signup logs in user and loads dashboard", () => {
  renderWithRoute("/signup");

  fireEvent.click(screen.getByText("Mock Signup Button"));

  expect(screen.getByText("Mock Dashboard newuser")).toBeInTheDocument();
});

test("redirects logged-out user from dashboard to login", () => {
  renderWithRoute("/dashboard");

  expect(screen.getByText("Mock Login Button")).toBeInTheDocument();
});

test("loads dashboard when logged in", () => {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("currentUser", "alice");

  renderWithRoute("/dashboard");

  expect(screen.getByText("Mock Dashboard alice")).toBeInTheDocument();
  expect(screen.getByText("Mock Navbar")).toBeInTheDocument();
});

test("loads profile when logged in", () => {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("currentUser", "bob");

  renderWithRoute("/profile");

  expect(screen.getByText("Mock Profile bob")).toBeInTheDocument();
});

test("public routes load without login", () => {
  renderWithRoute("/forgotPassword");
  expect(screen.getByText("Mock ForgotPassword")).toBeInTheDocument();

  renderWithRoute("/resetPassword");
  expect(screen.getByText("Mock ResetPassword")).toBeInTheDocument();
});

test("default route redirects based on login", () => {
  // logged out → /login
  renderWithRoute("/");
  expect(screen.getByText("Mock Login Button")).toBeInTheDocument();

  // logged in → /dashboard
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("currentUser", "sam");

  renderWithRoute("/");
  expect(screen.getByText("Mock Dashboard sam")).toBeInTheDocument();
});
