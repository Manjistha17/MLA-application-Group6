import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import Statistics from "../../components/statistics";

jest.mock("axios");

describe("Statistics Component", () => {
  const mockUser = "john";

  const mockResponse = {
    data: {
      stats: [
        {
          username: "john",
          exercises: [
            { exerciseType: "Running", totalDuration: 40 },
            { exerciseType: "Swimming", totalDuration: 25 },
          ],
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders fallback when no data returned", async () => {
    axios.get.mockResolvedValueOnce({ data: { stats: [] } });

    render(<Statistics currentUser={mockUser} />);

    // component initially shows "No data available"
    expect(screen.getByText(/No data available/i)).toBeInTheDocument();

    // axios should have been called with the correct endpoint
    expect(axios.get).toHaveBeenCalledWith(`/stats/${mockUser}`);
  });

  test("fetches and displays statistics for current user", async () => {
    axios.get.mockResolvedValueOnce(mockResponse);

    render(<Statistics currentUser={mockUser} />);

    // Wait for the "No data available" fallback to disappear (data loaded)
    await waitFor(() =>
      expect(screen.queryByText(/No data available/i)).not.toBeInTheDocument()
    );

    // Now assert the greeting is present
    expect(
      screen.getByText(/Well done,\s*john! This is your overall effort:/i)
    ).toBeInTheDocument();

    // Use regex to be robust against splitting or small markup differences
    expect(screen.getByText(/Running/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Duration:\s*40\s*min/i)).toBeInTheDocument();

    expect(screen.getByText(/Swimming/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Duration:\s*25\s*min/i)).toBeInTheDocument();

    // Ensure Axios was called correctly
    expect(axios.get).toHaveBeenCalledWith(`/stats/${mockUser}`);
  });

  test("handles API error gracefully", async () => {
    axios.get.mockRejectedValueOnce(new Error("API error"));

    render(<Statistics currentUser={mockUser} />);

    // When error occurs the component shows "No data available"
    await waitFor(() =>
      expect(screen.getByText(/No data available/i)).toBeInTheDocument()
    );

    expect(axios.get).toHaveBeenCalledWith(`/stats/${mockUser}`);
  });
});
