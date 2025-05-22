// client/src/__tests__/PlanDetailPage.test.jsx
import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, Routes, Route, MemoryRouter } from "react-router-dom";
import PlanDetailPage from "../components/PlanDetailPage";
import { PlanProvider } from "../context/PlanContext";
import { AccountProvider } from "../context/AccountContext";
import { NotificationProvider } from "../context/NotificationContext";

// Mock the hooks
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    ...originalModule,
    useParams: jest.fn(),
    useNavigate: () => mockedNavigate,
  };
});

jest.mock("../context/PlanContext", () => {
  const originalModule = jest.requireActual("../context/PlanContext");
  return {
    ...originalModule,
    usePlans: jest.fn(),
  };
});

jest.mock("../context/NotificationContext", () => {
  const originalModule = jest.requireActual("../context/NotificationContext");
  return {
    ...originalModule,
    useNotification: jest.fn(),
  };
});

// Mock data
const mockPlan = {
  id: 1,
  name: "Retirement Plan",
  description: "My retirement savings plan",
  start_date: "2025-01-01T00:00:00.000Z",
  end_date: "2045-01-01T00:00:00.000Z",
  created_at: "2025-01-01T00:00:00.000Z",
  accounts: [
    { id: 1, name: "Checking Account", type: "checking", balance: 5000 },
  ],
  credit_accounts: [
    {
      id: 1,
      name: "Visa Card",
      interest_rate: 18.5,
      balance: 2000,
    },
  ],
  loans: [
    {
      id: 1,
      name: "Car Loan",
      interest_rate: 4.5,
      balance: 15000,
      term_months: 48,
    },
  ],
  investment_accounts: [
    { id: 1, name: "401(k)", type: "retirement", balance: 75000 },
  ],
};

const renderWithProviders = (ui, options = {}) => {
  const { useParams } = require("react-router-dom");
  const { usePlans } = require("../context/PlanContext");
  const { useNotification } = require("../context/NotificationContext");

  // Default mock implementations
  useParams.mockReturnValue({ id: "1" });

  usePlans.mockReturnValue({
    getPlan: jest.fn().mockResolvedValue(mockPlan),
    linkAccountToPlan: jest.fn(),
    unlinkAccountFromPlan: jest.fn(),
    loading: false,
    error: null,
    ...options.planContextValues,
  });

  useNotification.mockReturnValue({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    ...options.notificationContextValues,
  });

  return render(
    <MemoryRouter initialEntries={["/plans/1"]}>
      <NotificationProvider>
        <PlanProvider>
          <AccountProvider>{ui}</AccountProvider>
        </PlanProvider>
      </NotificationProvider>
    </MemoryRouter>
  );
};

describe("PlanDetailPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state correctly", async () => {
    await act(async () => {
      renderWithProviders(<PlanDetailPage />, {
        planContextValues: { loading: true },
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/loading plan details/i)).toBeInTheDocument();
    });
  });

  test("renders error state correctly", async () => {
    await act(async () => {
      renderWithProviders(<PlanDetailPage />, {
        planContextValues: { error: "Failed to load plan" },
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to load plan/i)).toBeInTheDocument();
    });
  });

  test("renders plan details correctly", async () => {
    const getPlan = jest.fn().mockResolvedValue(mockPlan);

    await act(async () => {
      renderWithProviders(<PlanDetailPage />, {
        planContextValues: { getPlan },
      });
    });

    await waitFor(() => {
      expect(getPlan).toHaveBeenCalledWith("1");
    });

    // Check basic plan details
    expect(screen.getByText("Retirement Plan")).toBeInTheDocument();
    expect(screen.getByText("My retirement savings plan")).toBeInTheDocument();

    // Check for accounts in overview tab
    expect(screen.getByText("Plan Summary")).toBeInTheDocument();
    expect(
      screen.getByText(/with a predicted final amount of \$500,000/i)
    ).toBeInTheDocument();
  });

  test("can switch between tabs", async () => {
    await act(async () => {
      renderWithProviders(<PlanDetailPage />);
    });

    // Initially on overview tab
    await waitFor(() => {
      expect(screen.getByText("Plan Summary")).toBeInTheDocument();
    });

    // Switch to accounts tab
    await act(async () => {
      const accountsTabButton = screen.getAllByRole("button", {
        name: /accounts/i,
      })[0];
      fireEvent.click(accountsTabButton);
    });

    // Should now show accounts sections
    expect(screen.getByText("Standard Accounts")).toBeInTheDocument();
    expect(screen.getByText("Credit Accounts")).toBeInTheDocument();
    expect(screen.getByText("Loans")).toBeInTheDocument();
    expect(screen.getByText("Investment Accounts")).toBeInTheDocument();
  });

  test("displays linked accounts when available", async () => {
    await act(async () => {
      renderWithProviders(<PlanDetailPage />);
    });

    // Wait for plan to load
    await waitFor(() => {
      expect(screen.getByText("Retirement Plan")).toBeInTheDocument();
    });

    // Switch to accounts tab
    await act(async () => {
      const accountsTabButton = screen.getAllByRole("button", {
        name: /accounts/i,
      })[0];
      fireEvent.click(accountsTabButton);
    });

    // Check if accounts are displayed
    await waitFor(() => {
      expect(screen.getByText("Checking Account")).toBeInTheDocument();
    });

    // Additional checks in separate waitFor to avoid test timing issues
    await waitFor(() => {
      expect(screen.getByText("Visa Card")).toBeInTheDocument();
      expect(screen.getByText("Car Loan")).toBeInTheDocument();
      expect(screen.getByText("401(k)")).toBeInTheDocument();
    });
  });

  test("handles unlinking accounts", async () => {
    const unlinkAccountFromPlan = jest
      .fn()
      .mockResolvedValue({ success: true });
    const showSuccess = jest.fn();

    await act(async () => {
      renderWithProviders(<PlanDetailPage />, {
        planContextValues: {
          getPlan: jest.fn().mockResolvedValue(mockPlan),
          unlinkAccountFromPlan,
        },
        notificationContextValues: {
          showSuccess,
        },
      });
    });

    // Wait for plan to load
    await waitFor(() => {
      expect(screen.getByText("Retirement Plan")).toBeInTheDocument();
    });

    // Switch to accounts tab
    await act(async () => {
      const accountsTabButton = screen.getAllByRole("button", {
        name: /accounts/i,
      })[0];
      fireEvent.click(accountsTabButton);
    });

    // Wait for accounts to load
    await waitFor(() => {
      expect(screen.getByText("Checking Account")).toBeInTheDocument();
    });

    // Mock the confirm dialog to automatically return true
    window.confirm = jest.fn().mockImplementation(() => true);

    // Find unlink button by SVG path inside the button
    // This approach targets the specific elements we're looking for
    let unlinkButtons;
    await waitFor(() => {
      unlinkButtons = document.querySelectorAll(
        'button[title="Unlink account"]'
      );
      expect(unlinkButtons.length).toBeGreaterThan(0);
    });

    // Click the first unlink button to open the confirmation modal
    await act(async () => {
      fireEvent.click(unlinkButtons[0]);
    });

    // Find and click the confirm button in the modal
    let confirmButton;
    await waitFor(() => {
      confirmButton = screen.getByText("Confirm");
      expect(confirmButton).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(confirmButton);
    });

    // Check if API was called
    await waitFor(() => {
      expect(unlinkAccountFromPlan).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(showSuccess).toHaveBeenCalledWith(
        "Account successfully unlinked from plan"
      );
    });
  });
});
