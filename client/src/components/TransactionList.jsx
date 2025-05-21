import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    type: "",
    account_id: "",
    start_date: "",
    end_date: "",
    status: "",
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

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-700">Transactions</h2>
        <Link
          to="/transactions/new"
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition"
        >
          New Transaction
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(transaction.date)}
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
                    {transaction.from_account_id && (
                      <div className="text-xs">
                        From: {transaction.from_account_id}
                      </div>
                    )}
                    {transaction.to_account_id && (
                      <div className="text-xs">
                        To: {transaction.to_account_id}
                      </div>
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
            to="/transactions/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Create Transaction
          </Link>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
