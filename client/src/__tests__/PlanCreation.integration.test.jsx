// client/src/__tests__/PlanCreation.integration.test.jsx
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import NewPlanForm from "../components/NewPlanForm";
import { PlanProvider } from "../context/PlanContext";
import { NotificationProvider } from "../context/NotificationContext";

// Mock global fetch
global.fetch = jest.fn();

// Setup mock response
const mockPlanResponse = {
  status: "success",
  data: {
    id: 123,
    name: "Integration Test Plan",
    description: "Test plan for integration tests",
    start_date: "2025-07-01",
    end_date: "2035-07-01",
    created_at: "2025-05-20T12:00:00Z",
    updated_at: "2025-05-20T12:00:00Z",
  },
};

// Mock React Router hooks
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
    BrowserRouter: ({ children }) => <>{children}</>,
  };
});

// Utility function to render component with all providers
const renderWithProviders = (ui) => {
  return render(
    <MemoryRouter initialEntries={["/plans/new"]}>
      <NotificationProvider>
        <PlanProvider>{ui}</PlanProvider>
      </NotificationProvider>
    </MemoryRouter>
  );
};

describe("Plan Creation Integration Tests", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    global.fetch.mockReset();
  });

  test("successful plan creation sends correct data to API", async () => {
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlanResponse,
    });

    await act(async () => {
      renderWithProviders(<NewPlanForm />);
    });

    // Fill out the form
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText(/plan name/i),
        "Integration Test Plan"
      );
      await userEvent.type(
        screen.getByLabelText(/description/i),
        "Test plan for integration tests"
      );

      // Set dates
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);
      fireEvent.change(startDateInput, { target: { value: "2025-07-01" } });
      fireEvent.change(endDateInput, { target: { value: "2035-07-01" } });

      // Set predicted final amount
      await userEvent.type(
        screen.getByLabelText(/predicted final amount/i),
        "100000"
      );
    });

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /create plan/i });
    await act(async () => {
      await userEvent.click(submitButton);
    });

    // Verify API call
    await waitFor(() => {
      // Check that fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:5002/api/plans",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            name: "Integration Test Plan",
            description: "Test plan for integration tests",
            start_date: "2025-07-01",
            end_date: "2035-07-01",
          }),
        })
      );

      // Check that navigation occurred to the new plan's page
      expect(mockedNavigate).toHaveBeenCalledWith("/plans/123");
    });
  });

  test("handles API errors during plan creation", async () => {
    // Mock API error response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        status: "error",
        message: "Internal server error occurred",
      }),
    });

    await act(async () => {
      renderWithProviders(<NewPlanForm />);
    });

    // Fill out the form with minimal required data
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText(/plan name/i),
        "Error Test Plan"
      );

      // Set dates
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);
      fireEvent.change(startDateInput, { target: { value: "2025-06-01" } });
      fireEvent.change(endDateInput, { target: { value: "2035-06-01" } });
    });

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /create plan/i });
    await act(async () => {
      await userEvent.click(submitButton);
    });

    // Verify error handling
    await waitFor(() => {
      // Check that fetch was called
      expect(global.fetch).toHaveBeenCalled();

      // Check for error message display (needs component to be updated to show API errors)
      expect(
        screen.getByText(/internal server error occurred/i)
      ).toBeInTheDocument();

      // Navigation should not have occurred
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });

  test("handles CORS errors during plan creation", async () => {
    // Mock CORS error by rejecting the fetch
    global.fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await act(async () => {
      renderWithProviders(<NewPlanForm />);
    });

    // Fill out the form with minimal required data
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText(/plan name/i),
        "CORS Error Test"
      );

      // Set dates
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);
      fireEvent.change(startDateInput, { target: { value: "2025-08-01" } });
      fireEvent.change(endDateInput, { target: { value: "2035-08-01" } });
    });

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /create plan/i });
    await act(async () => {
      await userEvent.click(submitButton);
    });

    // Verify error handling
    await waitFor(() => {
      // Check that fetch was called
      expect(global.fetch).toHaveBeenCalled();

      // Component should show a network error message
      expect(screen.getByText(/failed to create plan/i)).toBeInTheDocument();

      // Navigation should not have occurred
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });

  test("validates form fields before submission", async () => {
    await act(async () => {
      renderWithProviders(<NewPlanForm />);
    });

    // Submit the form without filling any fields
    const submitButton = screen.getByRole("button", { name: /create plan/i });
    await act(async () => {
      await userEvent.click(submitButton);
    });

    // Verify form validation errors
    await waitFor(() => {
      // Check for validation error messages
      expect(screen.getByText(/plan name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/start date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/end date is required/i)).toBeInTheDocument();

      // API call should not have been made
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
