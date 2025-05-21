// client/src/__tests__/PlanForm.test.jsx
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

const renderWithProviders = (ui) => {
  return render(
    <MemoryRouter initialEntries={["/plans/new"]}>
      <NotificationProvider>
        <PlanProvider>{ui}</PlanProvider>
      </NotificationProvider>
    </MemoryRouter>
  );
};

describe("NewPlanForm Component", () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  test("renders all form inputs", async () => {
    await act(async () => {
      renderWithProviders(<NewPlanForm />);
    });

    // Wait for the component to fully render
    await waitFor(() => {
      // Check for form elements
      expect(screen.getByLabelText(/plan name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
      expect(screen.getByText(/create plan/i)).toBeInTheDocument();
    });
  });

  test("validates start date is before end date", async () => {
    let container;

    await act(async () => {
      const renderResult = renderWithProviders(<NewPlanForm />);
      container = renderResult.container;
    });

    // Fill in name
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/plan name/i), "Test Plan");
    });

    // Fill in dates in the wrong order
    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    // Directly set the input values instead of using clear
    await act(async () => {
      fireEvent.change(startDateInput, { target: { value: "2023-12-31" } });
      fireEvent.change(endDateInput, { target: { value: "2023-01-01" } });
    });

    // Submit the form
    const submitButton = container.querySelector('button[type="submit"]');
    expect(submitButton).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(submitButton);
    });

    // Expect error message
    await waitFor(() => {
      expect(
        screen.getByText(/end date must be after start date/i)
      ).toBeInTheDocument();
    });
  });

  test("submits form with valid data", async () => {
    // Mock the createPlan function
    const mockCreatePlan = jest
      .fn()
      .mockResolvedValue({ id: 1, name: "Test Plan" });

    const mockContextValue = {
      createPlan: mockCreatePlan,
      loadingPlans: false,
    };

    jest
      .spyOn(require("../context/PlanContext"), "usePlans")
      .mockImplementation(() => mockContextValue);

    let container;

    await act(async () => {
      const renderResult = renderWithProviders(<NewPlanForm />);
      container = renderResult.container;
    });

    // Fill in the form with valid data
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/plan name/i), "Test Plan");
    });

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    // Directly set the input values
    await act(async () => {
      fireEvent.change(startDateInput, { target: { value: "2023-01-01" } });
      fireEvent.change(endDateInput, { target: { value: "2023-12-31" } });
    });

    // Find the submit button by role with a more flexible approach
    const submitButton = container.querySelector('button[type="submit"]');
    expect(submitButton).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(submitButton);
    });

    // Check if createPlan was called with the correct data
    await waitFor(() => {
      expect(mockCreatePlan).toHaveBeenCalledWith({
        name: "Test Plan",
        description: "",
        start_date: "2023-01-01",
        end_date: "2023-12-31",
        target_amount: null,
      });
    });
  });
});
