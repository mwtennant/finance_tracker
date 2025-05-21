// LinkedAccountsSection.jsx
import React, { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";

const LinkedAccountsSection = ({
  title,
  accounts,
  accountType,
  onAddClick,
  onUnlinkClick,
  formatCurrency,
  isLoading,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const handleUnlinkClick = (account) => {
    setSelectedAccount(account);
    setShowConfirmModal(true);
  };

  const confirmUnlink = () => {
    if (selectedAccount) {
      onUnlinkClick(selectedAccount.id, accountType);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-purple-700">{title}</h3>
        <button
          onClick={onAddClick}
          className="text-purple-600 hover:text-purple-800 font-medium flex items-center transition-colors duration-200 rounded-full py-1 px-3 hover:bg-purple-100"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add {title.split(" ").pop()}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
        </div>
      ) : accounts && accounts.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {accounts.map((account) => (
            <li
              key={account.id}
              className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded transition-colors duration-200"
            >
              <div>
                <p className="font-medium">{account.name}</p>
                {accountType === "standard" && (
                  <p className="text-sm text-gray-600">
                    Type:{" "}
                    {account.type?.charAt(0).toUpperCase() +
                      account.type?.slice(1) || "N/A"}
                  </p>
                )}
                {accountType === "credit" && (
                  <p className="text-sm text-gray-600">
                    Interest: {account.interest_rate || 0}%
                  </p>
                )}
                {accountType === "loan" && (
                  <p className="text-sm text-gray-600">
                    Interest: {account.interest_rate || 0}%, Term:{" "}
                    {account.term_months || 0} months
                  </p>
                )}
                {accountType === "investment" && (
                  <p className="text-sm text-gray-600">
                    Type:{" "}
                    {account.type?.charAt(0).toUpperCase() +
                      account.type?.slice(1) || "N/A"}
                  </p>
                )}
              </div>
              <div className="flex items-center">
                <span className="mr-4 font-medium">
                  {formatCurrency(account.balance || 0)}
                </span>
                <button
                  onClick={() => handleUnlinkClick(account)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                  title="Unlink account"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
          <p className="mb-2">No {title.toLowerCase()} added</p>
          <p className="text-sm">
            Click the "Add" button to link accounts to this plan
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmUnlink}
        title="Unlink Account"
        message={`Are you sure you want to unlink ${
          selectedAccount?.name || "this account"
        } from the plan?`}
      />
    </div>
  );
};

export default LinkedAccountsSection;
