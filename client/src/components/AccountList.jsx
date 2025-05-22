// AccountList.jsx
import React, { useState, useContext } from "react";
import { AccountContext } from "../context/AccountContext";
import AccountForm from "./AccountForm";

const AccountList = ({ accountType = "standard", onAccountSelect = null }) => {
  const {
    standardAccounts,
    creditAccounts,
    loans,
    investmentAccounts,
    loading,
    error,
    deleteStandardAccount,
    deleteCreditAccount,
    deleteLoan,
    deleteInvestmentAccount,
  } = useContext(AccountContext);

  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

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

  // Get type display name
  const getAccountTypeName = (type) => {
    switch (accountType) {
      case "standard":
        switch (type) {
          case "checking":
            return "Checking Account";
          case "savings":
            return "Savings Account";
          case "cash":
            return "Cash Account";
          case "other":
            return "Other Account";
          default:
            return type.charAt(0).toUpperCase() + type.slice(1);
        }
      case "credit":
        return "Credit Card";
      case "loan":
        return "Loan";
      case "investment":
        switch (type) {
          case "ira":
            return "IRA";
          case "401k":
            return "401(k)";
          case "brokerage":
            return "Brokerage Account";
          case "roth":
            return "Roth IRA";
          default:
            return type.charAt(0).toUpperCase() + type.slice(1);
        }
      default:
        return "";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Handle account deletion
  const handleDelete = async (account) => {
    if (window.confirm(`Are you sure you want to delete ${account.name}?`)) {
      try {
        switch (accountType) {
          case "standard":
            await deleteStandardAccount(account.id);
            break;
          case "credit":
            await deleteCreditAccount(account.id);
            break;
          case "loan":
            await deleteLoan(account.id);
            break;
          case "investment":
            await deleteInvestmentAccount(account.id);
            break;
        }
      } catch (err) {
        console.error("Error deleting account:", err);
      }
    }
  };

  // Handle account edit
  const handleEdit = (account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  // Handle form save
  const handleFormSave = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  // Get account list title
  const getListTitle = () => {
    switch (accountType) {
      case "standard":
        return "Accounts";
      case "credit":
        return "Credit Cards";
      case "loan":
        return "Loans";
      case "investment":
        return "Investment Accounts";
      default:
        return "Accounts";
    }
  };

  // Render account details based on type
  const renderAccountDetails = (account) => {
    switch (accountType) {
      case "standard":
        return (
          <div className="text-gray-600">
            <p>Type: {getAccountTypeName(account.type)}</p>
            <p>Balance: {formatCurrency(account.balance)}</p>
            <p>APR: {account.apr ? `${account.apr}%` : "N/A"}</p>
          </div>
        );
      case "credit":
        return (
          <div className="text-gray-600">
            <p>Balance: {formatCurrency(account.balance)}</p>
            <p>Interest Rate: {account.interest_rate}%</p>
          </div>
        );
      case "loan":
        return (
          <div className="text-gray-600">
            <p>Balance: {formatCurrency(account.balance)}</p>
            <p>Interest Rate: {account.interest_rate}%</p>
            <p>Term: {account.term_months} months</p>
          </div>
        );
      case "investment":
        return (
          <div className="text-gray-600">
            <p>Type: {getAccountTypeName(account.type)}</p>
            <p>Balance: {formatCurrency(account.balance)}</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading accounts...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (showForm) {
    return (
      <AccountForm
        accountType={accountType}
        initialData={editingAccount}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />
    );
  }

  const accounts = getAccounts();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{getListTitle()}</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add New
        </button>
      </div>

      {accounts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No accounts found. Create one using the "Add New" button.
        </p>
      ) : (
        <ul className="space-y-4">
          {accounts.map((account) => (
            <li
              key={account.id}
              className="border rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{account.name}</h3>
                  {renderAccountDetails(account)}
                </div>
                <div className="flex space-x-2">
                  {onAccountSelect && (
                    <button
                      onClick={() => onAccountSelect(account)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Select
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(account)}
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(account)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AccountList;
