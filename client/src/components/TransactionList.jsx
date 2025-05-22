import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TransactionModal from "./TransactionModal";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State for account data
  const [accountNames, setAccountNames] = useState({});
  // State for edit modal
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    type: "",
    account_id: "",
    start_date: "",
    end_date: "",
    status: "",
    include_recurring: "true", // Include recurring by default
    sort_order: "ASC", // Sort oldest to newest
  });

  // Fetch transactions on component mount and when filters change
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);

        // Build query string from filters
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            queryParams.append(key, value);
          }
        });

        const response = await fetch(
          `http://localhost:5002/api/transactions?${queryParams}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setTransactions(data.data || []);
      } catch (err) {
        setError("Failed to load transactions. Please try again later.");
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filters]);

  // Fetch account information when component mounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        // Fetch standard accounts
        const standardRes = await fetch("http://localhost:5002/api/accounts");
        if (standardRes.ok) {
          const data = await standardRes.json();
          const accounts = data.data || [];
          accounts.forEach((account) => {
            setAccountNames((prev) => ({
              ...prev,
              [account.id]: account.name,
            }));
          });
        }

        // Fetch credit accounts
        const creditRes = await fetch(
          "http://localhost:5002/api/credit-accounts"
        );
        if (creditRes.ok) {
          const data = await creditRes.json();
          const accounts = data.data || [];
          accounts.forEach((account) => {
            setAccountNames((prev) => ({
              ...prev,
              [account.id]: account.name,
            }));
          });
        }

        // Fetch loans
        const loanRes = await fetch("http://localhost:5002/api/loans");
        if (loanRes.ok) {
          const data = await loanRes.json();
          const accounts = data.data || [];
          accounts.forEach((account) => {
            setAccountNames((prev) => ({
              ...prev,
              [account.id]: account.name,
            }));
          });
        }

        // Fetch investment accounts
        const investmentRes = await fetch(
          "http://localhost:5002/api/investment-accounts"
        );
        if (investmentRes.ok) {
          const data = await investmentRes.json();
          const accounts = data.data || [];
          accounts.forEach((account) => {
            setAccountNames((prev) => ({
              ...prev,
              [account.id]: account.name,
            }));
          });
        }
      } catch (err) {
        console.error("Error fetching account information:", err);
      }
    };

    fetchAccounts();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      type: "",
      account_id: "",
      start_date: "",
      end_date: "",
      status: "",
      include_recurring: "true",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get badge color based on status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Created":
        return "bg-gray-100 text-gray-800";
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Posted":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get badge color based on transaction type
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "deposit":
        return "bg-green-100 text-green-800";
      case "withdraw":
        return "bg-red-100 text-red-800";
      case "transfer":
        return "bg-blue-100 text-blue-800";
      case "loan_payment":
        return "bg-purple-100 text-purple-800";
      case "interest_paid":
        return "bg-yellow-100 text-yellow-800";
      case "interest_earned":
        return "bg-green-100 text-green-800";
      case "credit_card_spending":
        return "bg-orange-100 text-orange-800";
      case "credit_card_payment":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Check if a transaction is urgent (past scheduled date and not Posted/Canceled)
  const isTransactionUrgent = (transaction) => {
    const today = new Date();
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate < today &&
      transaction.status !== "Posted" &&
      transaction.status !== "Canceled"
    );
  };

  // Check if a transaction needs attention (within 7 days and not Scheduled/Canceled)
  const transactionNeedsAttention = (transaction) => {
    const today = new Date();
    const transactionDate = new Date(transaction.date);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    return (
      transactionDate <= sevenDaysFromNow &&
      transactionDate >= today &&
      transaction.status !== "Scheduled" &&
      transaction.status !== "Canceled"
    );
  }; // Format the accounts display
  const formatAccountsDisplay = (fromId, toId) => {
    if (!fromId && !toId) return "No accounts specified";

    const fromName = fromId
      ? accountNames[fromId] || `Account #${fromId}`
      : null;
    const toName = toId ? accountNames[toId] || `Account #${toId}` : null;

    if (fromId && toId) {
      return `Transfer from ${fromName} to ${toName}`;
    } else if (fromId) {
      return `From: ${fromName}`;
    } else if (toId) {
      return `To: ${toName}`;
    }
  };

  // Handle editing a transaction
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
  };

  // Handle saving transaction changes
  const handleSaveTransaction = (updatedTransaction) => {
    // Update the transaction in the list
    setTransactions(
      transactions.map((t) =>
        t.id === updatedTransaction.id ? updatedTransaction : t
      )
    );
    // Close the modal
    setEditingTransaction(null);
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (transaction) => {
    try {
      // If it's part of a recurring series, ask if user wants to delete the entire series
      if (transaction.recurring_series_id) {
        const deleteOptions = [
          { label: "Delete just this transaction", value: "single" },
          { label: "Delete this and all future transactions", value: "future" },
          { label: "Delete the entire recurring series", value: "series" },
        ];

        // Use a simple prompt for now (could be replaced with a better UI later)
        const userChoice = window.prompt(
          `This is part of a recurring series. What would you like to delete?\n\n1. Delete just this transaction\n2. Delete this and all future transactions\n3. Delete the entire recurring series\n\nEnter 1, 2, or 3:`,
          "1"
        );

        if (!userChoice) return; // User cancelled

        const choice = parseInt(userChoice);
        if (isNaN(choice) || choice < 1 || choice > 3) {
          alert("Invalid choice. Please try again.");
          return;
        }

        let deleteUrl = `http://localhost:5002/api/transactions/${transaction.id}`;

        if (choice === 2) {
          deleteUrl += "?delete_future=true";
        } else if (choice === 3) {
          deleteUrl += "?delete_series=true";
        }

        const response = await fetch(deleteUrl, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Refresh transactions
        setFilters((prev) => ({ ...prev }));
        return;
      }

      // Regular non-recurring transaction
      if (
        !window.confirm("Are you sure you want to delete this transaction?")
      ) {
        return;
      }

      const response = await fetch(
        `http://localhost:5002/api/transactions/${transaction.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Refresh transactions
      setFilters((prev) => ({ ...prev }));
    } catch (err) {
      setError("Failed to delete transaction. Please try again later.");
      console.error("Error deleting transaction:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Transactions</h2>
        <Link
          to="/dashboard/transactions/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Transaction
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="withdraw">Withdraw</option>
              <option value="transfer">Transfer</option>
              <option value="loan_payment">Loan Payment</option>
              <option value="interest_paid">Interest - Paid</option>
              <option value="interest_earned">Interest - Earned</option>
              <option value="credit_card_spending">Credit Card Spending</option>
              <option value="credit_card_payment">Credit Card Payment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Statuses</option>
              <option value="Created">Created</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Posted">Posted</option>
              <option value="Pending">Pending</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recurring Transactions
            </label>
            <select
              name="include_recurring"
              value={filters.include_recurring}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="true">Show All Transactions</option>
              <option value="false">Hide Recurring Transactions</option>
              <option value="only">Show Only Recurring Transactions</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="From"
              />
              <input
                type="date"
                name="end_date"
                value={filters.end_date}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="To"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
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
            Loading transactions...
          </div>
        </div>
      ) : transactions.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Accounts
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className={`hover:bg-gray-50 ${
                    isTransactionUrgent(transaction)
                      ? "bg-red-50 border-l-4 border-red-500"
                      : transactionNeedsAttention(transaction)
                      ? "bg-yellow-50 border-l-4 border-yellow-500"
                      : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(transaction.date)}
                    {transaction.recurring_series_id && (
                      <span
                        className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                        title="Part of a recurring series"
                      >
                        Recurring
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(
                        transaction.transaction_type
                      )}`}
                    >
                      {transaction.transaction_type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatAccountsDisplay(
                      transaction.from_account_id,
                      transaction.to_account_id
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        transaction.status
                      )}`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                    {transaction.description || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditTransaction(transaction)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a1 1 0 011 1v1h4a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h4V3a1 1 0 011-1zm1 3H9v2h2V5zm0 4H9v2h2V9zm0 4H9v2h2v-2zm4-8h-2V3h2v2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl text-center border border-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Transactions Found
          </h3>
          <p className="text-gray-600 mb-4">
            {Object.values(filters).some((filter) => filter !== "")
              ? "No transactions match your filter criteria. Try changing your filters or create a new transaction."
              : "You haven't created any transactions yet. Get started by creating your first transaction."}
          </p>
          <Link
            to="/dashboard/transactions/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Create Transaction
          </Link>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={handleSaveTransaction}
        />
      )}
    </div>
  );
};

export default TransactionList;
