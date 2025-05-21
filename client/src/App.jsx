import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import PlansDashboard from "./components/PlansDashboard";
import PlanDetailPage from "./components/PlanDetailPage";
import NewPlanForm from "./components/NewPlanForm";
import PlanForm from "./components/PlanForm";
import AccountsDashboard from "./components/AccountsDashboard";
import TransactionsDashboard from "./components/TransactionsDashboard";
import TailwindTest from "./components/TailwindTest";
import ErrorBoundary from "./components/ErrorBoundary";
import { PlanProvider } from "./context/PlanContext";
import { AccountProvider } from "./context/AccountContext";
import { NotificationProvider } from "./context/NotificationContext";

// Main navigation tabs
const mainTabs = [
  { label: "Plans", key: "plans", path: "/dashboard/plans" },
  { label: "Accounts", key: "accounts", path: "/dashboard/accounts" },
  {
    label: "Transactions",
    key: "transactions",
    path: "/dashboard/transactions",
  },
];

// Account subtypes for dropdown menu
const accountSubtypes = [
  { label: "Standard Accounts", key: "accounts", path: "/dashboard/accounts" },
  { label: "Loans", key: "loans", path: "/dashboard/loans" },
  {
    label: "Credit Cards",
    key: "creditCards",
    path: "/dashboard/credit-cards",
  },
  {
    label: "Investment Accounts",
    key: "investmentAccounts",
    path: "/dashboard/investments",
  },
];

function App() {
  const [accountsDropdownOpen, setAccountsDropdownOpen] = useState(false);

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <PlanProvider>
          <AccountProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-purple-50 font-sans">
                {/* App Header */}
                <header className="bg-white shadow-sm">
                  <div className="container mx-auto px-4 py-3 flex items-center">
                    <div className="text-2xl font-bold text-purple-700 mr-10">
                      Finance Tracker
                    </div>
                  </div>
                </header>

                {/* Persistent Navigation with Account Dropdown */}
                <nav className="flex border-b-2 border-purple-300 bg-white relative">
                  {mainTabs.map((tab) => (
                    <div key={tab.key} className="flex-1 relative">
                      {tab.key === "accounts" ? (
                        <div
                          className="relative"
                          onMouseEnter={() => setAccountsDropdownOpen(true)}
                          onMouseLeave={() => setAccountsDropdownOpen(false)}
                        >
                          <NavLink
                            to={tab.path}
                            className={({ isActive }) =>
                              `block w-full py-4 text-center text-lg font-semibold transition-colors duration-200 border-b-4 focus:outline-none
                              ${
                                isActive ||
                                window.location.pathname.includes(
                                  "/dashboard/loan"
                                ) ||
                                window.location.pathname.includes(
                                  "/dashboard/credit-cards"
                                ) ||
                                window.location.pathname.includes(
                                  "/dashboard/investments"
                                )
                                  ? "bg-purple-600 text-white border-purple-300"
                                  : "bg-transparent text-purple-900 border-transparent hover:bg-purple-100"
                              }`
                            }
                          >
                            {tab.label}
                          </NavLink>

                          {/* Accounts Dropdown Menu */}
                          {accountsDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 bg-white shadow-md z-20 border border-gray-200 rounded-b-md">
                              {accountSubtypes.map((subtype) => (
                                <NavLink
                                  key={subtype.key}
                                  to={subtype.path}
                                  className={({ isActive }) =>
                                    `block py-3 px-4 text-left text-gray-800 hover:bg-purple-100 transition-colors duration-150
                                    ${
                                      isActive
                                        ? "bg-purple-100 font-semibold"
                                        : ""
                                    }`
                                  }
                                >
                                  {subtype.label}
                                </NavLink>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <NavLink
                          to={tab.path}
                          className={({ isActive }) =>
                            `block w-full py-4 text-center text-lg font-semibold transition-colors duration-200 border-b-4 focus:outline-none
                            ${
                              isActive
                                ? "bg-purple-600 text-white border-purple-300"
                                : "bg-transparent text-purple-900 border-transparent hover:bg-purple-100"
                            }`
                          }
                        >
                          {tab.label}
                        </NavLink>
                      )}
                    </div>
                  ))}
                </nav>

                <div className="container mx-auto px-4 py-6">
                  <Routes>
                    {/* Redirect root to dashboard/plans */}
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard/plans" replace />}
                    />

                    {/* Dashboard routes */}
                    <Route
                      path="/dashboard/plans"
                      element={<PlansDashboard />}
                    />
                    <Route
                      path="/dashboard/accounts"
                      element={<AccountsDashboard />}
                    />
                    <Route
                      path="/dashboard/loans"
                      element={<Dashboard section="loans" />}
                    />
                    <Route
                      path="/dashboard/credit-cards"
                      element={<Dashboard section="creditCards" />}
                    />
                    <Route
                      path="/dashboard/investments"
                      element={<Dashboard section="investmentAccounts" />}
                    />
                    <Route
                      path="/dashboard/transactions/*"
                      element={<TransactionsDashboard />}
                    />

                    {/* Plan-specific routes */}
                    <Route path="/plans/new" element={<NewPlanForm />} />
                    <Route
                      path="/plans/:id/edit"
                      element={<PlanForm isEditMode={true} />}
                    />
                    <Route path="/plans/:id" element={<PlanDetailPage />} />

                    {/* Legacy routes */}
                    <Route
                      path="/dashboard"
                      element={<Navigate to="/dashboard/plans" replace />}
                    />
                    <Route path="/tailwind-test" element={<TailwindTest />} />

                    {/* Catch all */}
                    <Route
                      path="*"
                      element={<Navigate to="/dashboard/plans" replace />}
                    />
                  </Routes>
                </div>
              </div>
            </BrowserRouter>
          </AccountProvider>
        </PlanProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
