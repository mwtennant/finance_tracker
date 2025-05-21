// client/src/__tests__/PlansDashboard.test.jsx
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import PlansDashboard from "../components/PlansDashboard";
import { PlanProvider } from "../context/PlanContext";
import { NotificationProvider } from "../context/NotificationContext";

// Mock React Router components
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    ...originalModule,
  };
});

// Mock the PlanContext hooks
jest.mock("../context/PlanContext", () => {
  const originalModule = jest.requireActual("../context/PlanContext");
  return {
    ...originalModule,
    usePlans: jest.fn(),
  };
});

const mockPlans = [
  {
    id: 1,
    name: "Retirement Plan",
    created_at: "2025-01-01T00:00:00.000Z",
    start_date: "2025-01-01T00:00:00.000Z",
    end_date: "2045-01-01T00:00:00.000Z",
    target_amount: 500000,
  },
  {
    id: 2,
    name: "House Down Payment",
    created_at: "2025-02-15T00:00:00.000Z",
    start_date: "2025-03-01T00:00:00.000Z",
    end_date: "2030-03-01T00:00:00.000Z",
    target_amount: 100000,
  },
];

const renderWithProviders = (ui, planContextValues = {}) => {
  const { usePlans } = require("../context/PlanContext");

  // Default mock implementation
  usePlans.mockReturnValue({
    plans: [],
    loading: false,
    error: null,
    refreshPlans: jest.fn(),
    ...planContextValues,
  });

  // Mock useEffect to prevent the actual fetch being called
  jest.spyOn(React, "useEffect").mockImplementationOnce((f) => f());

  return render(
    <MemoryRouter initialEntries={["/plans"]}>
      <NotificationProvider>
        <PlanProvider>{ui}</PlanProvider>
      </NotificationProvider>
    </MemoryRouter>
  );
};

describe("PlansDashboard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state correctly", async () => {
    await act(async () => {
      renderWithProviders(<PlansDashboard />, { loading: true });
    });
    expect(screen.getByText(/loading plans/i)).toBeInTheDocument();
  });

  test("renders error state correctly", async () => {
    await act(async () => {
      renderWithProviders(<PlansDashboard />, {
        error: "Failed to load plans",
      });
    });
    expect(screen.getByText(/error loading plans/i)).toBeInTheDocument();
    expect(screen.getByText(/failed to load plans/i)).toBeInTheDocument();
  });

  test("renders empty state when no plans are available", async () => {
    await act(async () => {
      renderWithProviders(<PlansDashboard />, { plans: [] });
    });
    expect(
      screen.getByText(/you don't have any financial plans yet/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/create your first plan to get started/i)
    ).toBeInTheDocument();
  });

  test("renders plans correctly when available", async () => {
    await act(async () => {
      renderWithProviders(<PlansDashboard />, { plans: mockPlans });
    });

    // Check if plan names are displayed
    expect(screen.getByText("Retirement Plan")).toBeInTheDocument();
    expect(screen.getByText("House Down Payment")).toBeInTheDocument();

    // Check for dates and other info
    expect(screen.getAllByText(/start date:/i)).toHaveLength(2);
    expect(screen.getAllByText(/end date:/i)).toHaveLength(2);

    // Check for target amount
    expect(screen.getByText(/target: \$500,000/i)).toBeInTheDocument();
    expect(screen.getByText(/target: \$100,000/i)).toBeInTheDocument();
  });

  test("calls refreshPlans on component mount", async () => {
    const mockRefreshPlans = jest.fn();

    await act(async () => {
      renderWithProviders(<PlansDashboard />, {
        refreshPlans: mockRefreshPlans,
      });
    });

    await waitFor(() => {
      expect(mockRefreshPlans).toHaveBeenCalledTimes(1);
    });
  });

  test('has a working "Add New Plan" button', async () => {
    await act(async () => {
      renderWithProviders(<PlansDashboard />);
    });
    const addButton = screen.getByText("Add New Plan");
    expect(addButton).toBeInTheDocument();
    expect(addButton.closest("a")).toHaveAttribute("href", "/plans/new");
  });
});
