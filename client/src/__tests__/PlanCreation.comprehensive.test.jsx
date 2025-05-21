// client/src/__tests__/PlanCreation.comprehensive.test.jsx
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import NewPlanForm from "../components/NewPlanForm";
import { PlanProvider } from "../context/PlanContext";
import { NotificationProvider } from "../context/NotificationContext";

// Mock global fetch
global.fetch = jest.fn();

// Mock React Router hooks
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
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

describe("Plan Creation Comprehensive Tests", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    global.fetch.mockReset();
  });

  describe("Form Validation", () => {
    test("validates required fields", async () => {
      await act(async () => {
        renderWithProviders(<NewPlanForm />);
      });

      // Submit the form without filling any fields
      const submitButton = screen.getByRole("button", { name: /create plan/i });
      await act(async () => {
        await userEvent.click(submitButton);
      });

      // Verify validation errors
      await waitFor(() => {
        expect(screen.getByText(/plan name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/start date is required/i)).toBeInTheDocument();
        expect(screen.getByText(/end date is required/i)).toBeInTheDocument();
      });

      // API call should not have been made
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("validates date range", async () => {
      await act(async () => {
        renderWithProviders(<NewPlanForm />);
      });

      // Fill name but set invalid dates (end date before start date)
      await act(async () => {
        await userEvent.type(
          screen.getByLabelText(/plan name/i),
          "Invalid Date Plan"
        );

        // Set invalid dates
        const startDateInput = screen.getByLabelText(/start date/i);
        const endDateInput = screen.getByLabelText(/end date/i);
        fireEvent.change(startDateInput, { target: { value: "2030-01-01" } });
        fireEvent.change(endDateInput, { target: { value: "2025-01-01" } });
      });

      // Submit the form
      const submitButton = screen.getByRole("button", { name: /create plan/i });
      await act(async () => {
        await userEvent.click(submitButton);
      });

      // Verify validation error for dates
      await waitFor(() => {
        expect(
          screen.getByText(/end date must be after start date/i)
        ).toBeInTheDocument();
      });

      // API call should not have been made
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("API Interaction", () => {
    test("successfully creates plan with minimum required fields", async () => {
      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: "success",
          data: {
            id: 101,
            name: "Minimum Fields Plan",
            description: null,
            start_date: "2025-01-01",
            end_date: "2030-01-01",
            created_at: "2025-05-20T12:00:00Z",
            updated_at: "2025-05-20T12:00:00Z",
          },
        }),
      });

      await act(async () => {
        renderWithProviders(<NewPlanForm />);
      });

      // Fill only required fields
      await act(async () => {
        await userEvent.type(
          screen.getByLabelText(/plan name/i),
          "Minimum Fields Plan"
        );

        // Set dates
        const startDateInput = screen.getByLabelText(/start date/i);
        const endDateInput = screen.getByLabelText(/end date/i);
        fireEvent.change(startDateInput, { target: { value: "2025-01-01" } });
        fireEvent.change(endDateInput, { target: { value: "2030-01-01" } });
      });

      // Submit the form
      const submitButton = screen.getByRole("button", { name: /create plan/i });
      await act(async () => {
        await userEvent.click(submitButton);
      });

      // Verify API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:5002/api/plans",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
              name: "Minimum Fields Plan",
              description: "",
              start_date: "2025-01-01",
              end_date: "2030-01-01",
            }),
          })
        );

        // Navigation should occur to the new plan page
        expect(mockedNavigate).toHaveBeenCalledWith("/plans/101");
      });
    });

    test("handles server validation errors", async () => {
      // Mock API response with server validation error
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          status: "error",
          message: "Server validation failed: Invalid plan data",
        }),
      });

      await act(async () => {
        renderWithProviders(<NewPlanForm />);
      });

      // Fill required fields
      await act(async () => {
        await userEvent.type(
          screen.getByLabelText(/plan name/i),
          "Server Error Plan"
        );

        // Set dates
        const startDateInput = screen.getByLabelText(/start date/i);
        const endDateInput = screen.getByLabelText(/end date/i);
        fireEvent.change(startDateInput, { target: { value: "2025-02-01" } });
        fireEvent.change(endDateInput, { target: { value: "2030-02-01" } });
      });

      // Submit the form
      const submitButton = screen.getByRole("button", { name: /create plan/i });
      await act(async () => {
        await userEvent.click(submitButton);
      });

      // Verify error handling
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        expect(
          screen.getByText(/server validation failed/i)
        ).toBeInTheDocument();
        expect(mockedNavigate).not.toHaveBeenCalled();
      });
    });

    test("handles network errors gracefully", async () => {
      // Mock network failure
      global.fetch.mockRejectedValueOnce(new Error("Network failure"));

      await act(async () => {
        renderWithProviders(<NewPlanForm />);
      });

      // Fill required fields
      await act(async () => {
        await userEvent.type(
          screen.getByLabelText(/plan name/i),
          "Network Error Plan"
        );

        // Set dates
        const startDateInput = screen.getByLabelText(/start date/i);
        const endDateInput = screen.getByLabelText(/end date/i);
        fireEvent.change(startDateInput, { target: { value: "2025-03-01" } });
        fireEvent.change(endDateInput, { target: { value: "2030-03-01" } });
      });

      // Submit the form
      const submitButton = screen.getByRole("button", { name: /create plan/i });
      await act(async () => {
        await userEvent.click(submitButton);
      });

      // Verify error handling
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        expect(screen.getByText(/failed to create plan/i)).toBeInTheDocument();
        expect(mockedNavigate).not.toHaveBeenCalled();
      });
    });

    test("correctly processes plan with all fields", async () => {
      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: "success",
          data: {
            id: 102,
            name: "Complete Plan",
            description: "This is a complete plan with all fields",
            start_date: "2026-01-01",
            end_date: "2036-01-01",
            created_at: "2025-05-20T12:00:00Z",
            updated_at: "2025-05-20T12:00:00Z",
          },
        }),
      });

      await act(async () => {
        renderWithProviders(<NewPlanForm />);
      });

      // Fill all fields
      await act(async () => {
        await userEvent.type(
          screen.getByLabelText(/plan name/i),
          "Complete Plan"
        );
        await userEvent.type(
          screen.getByLabelText(/description/i),
          "This is a complete plan with all fields"
        );

        // Set dates
        const startDateInput = screen.getByLabelText(/start date/i);
        const endDateInput = screen.getByLabelText(/end date/i);
        fireEvent.change(startDateInput, { target: { value: "2026-01-01" } });
        fireEvent.change(endDateInput, { target: { value: "2036-01-01" } });
      });

      // Submit the form
      const submitButton = screen.getByRole("button", { name: /create plan/i });
      await act(async () => {
        await userEvent.click(submitButton);
      });

      // Verify API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:5002/api/plans",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
              name: "Complete Plan",
              description: "This is a complete plan with all fields",
              start_date: "2026-01-01",
              end_date: "2036-01-01",
            }),
          })
        );

        // Navigation should occur to the new plan page
        expect(mockedNavigate).toHaveBeenCalledWith("/plans/102");
      });
    });
  });
});
