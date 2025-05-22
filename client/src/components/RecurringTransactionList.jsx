import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RecurringTransactionModal from "./RecurringTransactionModal";

const RecurringTransactionList = () => {
  const [recurringSeries, setRecurringSeries] = useState([]);
  const [expandedSeries, setExpandedSeries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountNames, setAccountNames] = useState({});
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch recurring series on component mount
  useEffect(() => {
    const fetchRecurringSeries = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "http://localhost:5002/api/recurring-transactions"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setRecurringSeries(data.data || []);

        // Initialize expanded state for all series
        const expanded = {};
        data.data.forEach((series) => {
          expanded[series.id] = false;
        });
        setExpandedSeries(expanded);
      } catch (err) {
        setError(
          "Failed to load recurring transactions. Please try again later."
        );
        console.error("Error fetching recurring transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecurringSeries();
  }, []);

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

  // Toggle expanded state for a series
  const toggleExpand = async (seriesId) => {
    // If expanding and we haven't loaded details yet, fetch them
    if (!expandedSeries[seriesId]) {
      try {
        const response = await fetch(
          `http://localhost:5002/api/recurring-transactions/${seriesId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Update the series with details
        setRecurringSeries((prevSeries) =>
          prevSeries.map((series) =>
            series.id === seriesId
              ? {
                  ...series,
                  template: data.data.template,
                  instances: data.data.instances,
                }
              : series
          )
        );
      } catch (err) {
        console.error("Error fetching series details:", err);
      }
    }

    // Toggle expanded state
    setExpandedSeries((prev) => ({
      ...prev,
      [seriesId]: !prev[seriesId],
    }));
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
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format recurrence pattern as text
  const formatRecurrencePattern = (series) => {
    if (!series) return "";

    const { recurrence_type, recurrence_interval } = series;
    const interval = recurrence_interval || 1;

    let unit = "";
    switch (recurrence_type) {
      case "daily":
        unit = interval === 1 ? "day" : "days";
        break;
      case "weekly":
        unit = interval === 1 ? "week" : "weeks";
        break;
      case "monthly":
        unit = interval === 1 ? "month" : "months";
        break;
      case "yearly":
        unit = interval === 1 ? "year" : "years";
        break;
      default:
        unit = "period(s)";
    }

    return `Every ${interval} ${unit}`;
  };

  // Open edit modal for a series
  const openSeriesModal = (series) => {
    setSelectedSeries(series);
    setModalOpen(true);
  };

  // Handle delete series
  const handleDeleteSeries = async (seriesId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this recurring transaction series and all its instances?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5002/api/recurring-transactions/${seriesId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Update the list
      setRecurringSeries((prevSeries) =>
        prevSeries.filter((series) => series.id !== seriesId)
      );
    } catch (err) {
      setError("Failed to delete recurring transaction series.");
      console.error("Error deleting series:", err);
    }
  };

  if (loading && recurringSeries.length === 0) {
    return (
      <div className="text-center p-4">Loading recurring transactions...</div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">Error: {error}</div>
    );
  }

  if (recurringSeries.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="mb-4">No recurring transactions found.</p>
        <Link
          to="/dashboard/transactions/recurring/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Add Recurring Transaction
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Recurring Transactions
        </h2>
        <Link
          to="/dashboard/transactions/recurring/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Recurring Transaction
        </Link>
      </div>

      {recurringSeries.map((series) => (
        <div
          key={series.id}
          className="mb-6 bg-white rounded-lg shadow overflow-hidden"
        >
          {/* Series Header */}
          <div
            className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
            onClick={() => toggleExpand(series.id)}
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{series.name}</h3>
              <div className="text-sm text-gray-600">
                {formatRecurrencePattern(series)}
                {series.end_date
                  ? ` · Ends ${formatDate(series.end_date)}`
                  : " · No end date"}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  openSeriesModal(series);
                }}
              >
                Edit
              </button>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSeries(series.id);
                }}
              >
                Delete
              </button>
              <span className="text-gray-400">
                {expandedSeries[series.id] ? "▲" : "▼"}
              </span>
            </div>
          </div>

          {/* Series Instances */}
          {expandedSeries[series.id] && series.instances && (
            <div className="px-4 pb-4">
              <table className="w-full mt-4">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">From/To</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {series.instances.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-100"
                    >
                      <td className="py-2">{formatDate(transaction.date)}</td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            transaction.status === "Posted"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "Scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : transaction.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : transaction.status === "Canceled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-2">
                        {transaction.from_account_id && (
                          <div>
                            From:{" "}
                            {accountNames[transaction.from_account_id] ||
                              transaction.from_account_id}
                          </div>
                        )}
                        {transaction.to_account_id && (
                          <div>
                            To:{" "}
                            {accountNames[transaction.to_account_id] ||
                              transaction.to_account_id}
                          </div>
                        )}
                      </td>
                      <td className="py-2 font-medium">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="py-2">
                        <div className="flex space-x-2">
                          <Link
                            to={`/transactions/${transaction.id}`}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {modalOpen && selectedSeries && (
        <RecurringTransactionModal
          series={selectedSeries}
          onClose={() => setModalOpen(false)}
          onUpdate={(updatedSeries) => {
            setRecurringSeries((prevSeries) =>
              prevSeries.map((series) =>
                series.id === updatedSeries.id ? updatedSeries : series
              )
            );
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default RecurringTransactionList;
