import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePlans } from "../context/PlanContext";
import { AccountContext } from "../context/AccountContext";
import { useNotification } from "../context/NotificationContext";
import AccountModal from "./AccountModal";
import LinkedAccountsSection from "./LinkedAccountsSection";

const PlanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPlan, linkAccountToPlan, unlinkAccountFromPlan, loading, error } =
    usePlans();
  const { showSuccess, showError } = useNotification();
  const [plan, setPlan] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch plan data
  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        setPlan(null); // Clear plan data before fetching
        const planData = await getPlan(id);
        if (planData) {
          setPlan(planData);
        }
        // If planData is null, the plan wasn't found
        // The error state will be set by getPlan
      } catch (err) {
        // Additional error handling if needed
        console.error("Error in fetchPlanData:", err);
      }
    };

    fetchPlanData();
  }, [id, getPlan, refreshTrigger]);

  // Modal state for adding accounts
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);

  // Open modal with specified type
  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
  };

  // Format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Handle unlinking an account
  const handleUnlinkAccount = async (accountId, accountType) => {
    try {
      await unlinkAccountFromPlan(id, accountId, accountType);
      // Refresh plan data
      setRefreshTrigger((prev) => prev + 1);
      showSuccess("Account successfully unlinked from plan");
    } catch (err) {
      console.error("Error unlinking account:", err);
      showError(err.message || "Failed to unlink account");
    }
  };

  // Refresh plan data after linking an account
  const handleAccountLinked = () => {
    setRefreshTrigger((prev) => prev + 1);
    showSuccess("Account successfully linked to plan");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-purple-600">
          <svg
            className="animate-spin h-8 w-8 mr-3 inline-block text-purple-600"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading plan details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-8 rounded-xl text-center max-w-3xl mx-auto mt-8 shadow-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-16 w-16 text-red-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-2xl text-red-600 font-bold mb-4">
          {error.includes("not found")
            ? "Plan Not Found"
            : "Unable to Load Plan"}
        </h2>
        <p className="mb-6 text-gray-700">{error}</p>
        <p className="mb-6 text-gray-600 text-sm">
          {error.includes("not found")
            ? "The plan you're looking for doesn't exist or might have been deleted."
            : "There was a problem connecting to the server. Please try again later."}
        </p>
        <Link
          to="/dashboard/plans"
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition duration-200"
        >
          Return to Plans Dashboard
        </Link>
      </div>
    );
  }

  if (!plan && !error && !loading) {
    // This should never happen with the improved error handling,
    // but keep it as a fallback for unexpected scenarios
    return (
      <div className="bg-yellow-50 p-8 rounded-xl text-center max-w-3xl mx-auto mt-8">
        <h2 className="text-2xl text-yellow-600 mb-4">Something Went Wrong</h2>
        <p className="mb-6">
          There was an unexpected error. Please try again or return to the
          dashboard.
        </p>
        <Link
          to="/dashboard/plans"
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 p-4">
      <Link
        to="/dashboard/plans"
        className="text-purple-600 hover:text-purple-800 mb-6 inline-block"
      >
        &larr; Back to All Plans
      </Link>

      {/* Plan Header */}
      <section className="bg-purple-100 rounded-2xl p-8 mb-8 shadow-md">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-purple-600 text-3xl font-bold">{plan.name}</h2>
          <div className="space-x-2">
            <Link
              to={`/plans/${id}/edit`}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg inline-block"
            >
              Edit Plan
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-purple-600 font-semibold mb-1">Start Date</h3>
            <p className="text-lg">{formatDate(plan.start_date)}</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-purple-600 font-semibold mb-1">End Date</h3>
            <p className="text-lg">{formatDate(plan.end_date)}</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-purple-600 font-semibold mb-1">
              Target Amount
            </h3>
            <p className="text-xl text-purple-700 font-bold">
              ${plan.target_amount ? plan.target_amount.toLocaleString() : "0"}
            </p>
          </div>
        </div>

        {plan.description && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-purple-600 font-semibold mb-1">Description</h3>
            <p className="text-gray-700">{plan.description}</p>
          </div>
        )}
      </section>

      {/* Tabs for different sections */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "overview"
                  ? "text-purple-600 border-purple-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab("accounts")}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "accounts"
                  ? "text-purple-600 border-purple-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              Accounts
            </button>
          </li>
        </ul>
      </div>

      {/* Account Cards Section */}
      {activeTab === "accounts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Standard Accounts Section */}
          <LinkedAccountsSection
            title="Standard Accounts"
            accounts={plan.accounts || []}
            accountType="standard"
            onAddClick={() => openModal("standard")}
            onUnlinkClick={handleUnlinkAccount}
            formatCurrency={formatCurrency}
            isLoading={loading}
          />

          {/* Credit Accounts Section */}
          <LinkedAccountsSection
            title="Credit Accounts"
            accounts={plan.credit_accounts || []}
            accountType="credit"
            onAddClick={() => openModal("credit")}
            onUnlinkClick={handleUnlinkAccount}
            formatCurrency={formatCurrency}
            isLoading={loading}
          />

          {/* Loans Section */}
          <LinkedAccountsSection
            title="Loans"
            accounts={plan.loans || []}
            accountType="loan"
            onAddClick={() => openModal("loan")}
            onUnlinkClick={handleUnlinkAccount}
            formatCurrency={formatCurrency}
            isLoading={loading}
          />

          {/* Investment Accounts Section */}
          <LinkedAccountsSection
            title="Investment Accounts"
            accounts={plan.investment_accounts || []}
            accountType="investment"
            onAddClick={() => openModal("investment")}
            onUnlinkClick={handleUnlinkAccount}
            formatCurrency={formatCurrency}
            isLoading={loading}
          />
        </div>
      )}

      {/* Overview Tab Content */}
      {activeTab === "overview" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-purple-700 mb-4">
            Plan Summary
          </h3>
          <p className="text-gray-600 mb-6">
            This plan runs from {formatDate(plan.start_date)} to{" "}
            {formatDate(plan.end_date)}
            {plan.target_amount
              ? ` with a target amount of $${plan.target_amount.toLocaleString()}.`
              : "."}
          </p>

          <div className="bg-purple-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-purple-700 mb-2">
              Linked Accounts
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Standard Accounts:</p>
                <p className="font-medium">
                  {plan.accounts ? plan.accounts.length : 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Credit Accounts:</p>
                <p className="font-medium">
                  {plan.credit_accounts ? plan.credit_accounts.length : 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Loans:</p>
                <p className="font-medium">
                  {plan.loans ? plan.loans.length : 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Investment Accounts:</p>
                <p className="font-medium">
                  {plan.investment_accounts
                    ? plan.investment_accounts.length
                    : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setActiveTab("accounts")}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg"
            >
              Manage Accounts
            </button>
          </div>
        </div>
      )}

      {/* Account Modal for linking accounts */}
      {showModal && (
        <AccountModal
          isOpen={showModal}
          onClose={closeModal}
          planId={id}
          accountType={modalType}
          onAccountLinked={handleAccountLinked}
        />
      )}
    </div>
  );
};

export default PlanDetailPage;
