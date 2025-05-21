// AccountModal.jsx
import React, { useContext } from "react";
import { AccountContext } from "../context/AccountContext";
import { usePlans } from "../context/PlanContext";
import { useNotification } from "../context/NotificationContext";

const AccountModal = ({
  isOpen,
  onClose,
  planId,
  accountType,
  onAccountLinked,
}) => {
  const {
    standardAccounts,
    creditAccounts,
    loans,
    investmentAccounts,
    loading,
    error,
  } = useContext(AccountContext);
  const { linkAccountToPlan } = usePlans();
  const { showError } = useNotification();

  if (!isOpen) return null;

  // Get accounts based on type
  const getAccounts = () => {
    switch (accountType) {
      case "standard":
        return standardAccounts;
      case "credit":
        return creditAccounts;
      case "loan":
        return loans;
      case "investment":
        return investmentAccounts;
      default:
        return [];
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get type label
  const getTypeLabel = () => {
    switch (accountType) {
      case "standard":
        return "Account";
      case "credit":
        return "Credit Card";
      case "loan":
        return "Loan";
      case "investment":
        return "Investment Account";
      default:
        return "Account";
    }
  };

  // Link account to plan
  const handleLinkAccount = async (account) => {
    try {
      await linkAccountToPlan(planId, account.id, accountType);
      if (onAccountLinked) {
        onAccountLinked();
      }
      onClose();
    } catch (err) {
      console.error("Error linking account:", err);
      showError(err.message || "Failed to link account to plan");
    }
  };

  const accounts = getAccounts();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Add {getTypeLabel()}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-4 text-center">Loading accounts...</div>
        ) : error ? (
          <div className="py-4 text-center text-red-600">{error}</div>
        ) : accounts.length === 0 ? (
          <div className="py-4 text-center">
            <p className="mb-4">
              No {getTypeLabel().toLowerCase()}s available to add.
            </p>
            <p>
              <a
                href="/dashboard/accounts"
                className="text-blue-600 hover:underline"
              >
                Go to Accounts Dashboard to create one
              </a>
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleLinkAccount(account)}
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-semibold">{account.name}</h4>
                    <p className="text-sm text-gray-600">
                      Balance: {formatCurrency(account.balance)}
                    </p>
                  </div>
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLinkAccount(account);
                    }}
                  >
                    Link
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
