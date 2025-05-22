import React, { useState, useEffect } from "react";

const TransactionModal = ({ transaction, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: transaction?.id || "",
    transaction_type: transaction?.transaction_type || "deposit",
    from_account_id: transaction?.from_account_id || "",
    to_account_id: transaction?.to_account_id || "",
    amount: transaction?.amount || "",
    date: transaction?.date || new Date().toISOString().slice(0, 10),
    status: transaction?.status || "Created",
    description: transaction?.description || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState({
    standard: [],
    credit: [],
    loan: [],
    investment: [],
  });

  // Fetch accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        // Fetch standard accounts
        const standardRes = await fetch("http://localhost:5002/api/accounts");
        if (standardRes.ok) {
          const data = await standardRes.json();
          setAccounts((prev) => ({ ...prev, standard: data.data || [] }));
        }

        // Fetch credit accounts
        const creditRes = await fetch(
          "http://localhost:5002/api/credit-accounts"
        );
        if (creditRes.ok) {
          const data = await creditRes.json();
          setAccounts((prev) => ({ ...prev, credit: data.data || [] }));
        }

        // Fetch loans
        const loanRes = await fetch("http://localhost:5002/api/loans");
        if (loanRes.ok) {
          const data = await loanRes.json();
          setAccounts((prev) => ({ ...prev, loan: data.data || [] }));
        }

        // Fetch investment accounts
        const investmentRes = await fetch(
          "http://localhost:5002/api/investment-accounts"
        );
        if (investmentRes.ok) {
          const data = await investmentRes.json();
          setAccounts((prev) => ({ ...prev, investment: data.data || [] }));
        }
      } catch (err) {
        setError("Failed to load accounts. Please try again later.");
        console.error("Error fetching accounts:", err);
      }
    };

    fetchAccounts();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Only send values that are needed for a status update
      const apiData = {
        status: formData.status,
      };

      const response = await fetch(
        `http://localhost:5002/api/transactions/${transaction.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      onSave(data.data);
    } catch (err) {
      setError("Failed to update transaction. Please try again.");
      console.error("Error updating transaction:", err);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get account options based on transaction type
  const getFromAccountOptions = () => {
    switch (formData.transaction_type) {
      case "withdraw":
      case "transfer":
      case "interest_paid":
        return [...accounts.standard, ...accounts.investment];
      case "loan_payment":
      case "credit_card_payment":
        return [...accounts.standard];
      default:
        return [];
    }
  };

  const getToAccountOptions = () => {
    switch (formData.transaction_type) {
      case "deposit":
      case "transfer":
      case "interest_earned":
        return [...accounts.standard, ...accounts.investment];
      case "loan_payment":
        return accounts.loan;
      case "credit_card_spending":
      case "credit_card_payment":
        return accounts.credit;
      default:
        return [];
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3
                  className="text-lg leading-6 font-medium text-gray-900"
                  id="modal-title"
                >
                  Edit Transaction
                </h3>
                <div className="mt-4">
                  {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Transaction Details (read-only) */}
                    <div className="space-y-3 mb-6 border-b pb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Transaction Type
                        </label>
                        <div className="mt-1 text-sm text-gray-900">
                          {formData.transaction_type.replace(/_/g, " ")}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Amount
                        </label>
                        <div className="mt-1 text-sm text-gray-900">
                          {formatCurrency(formData.amount)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Date
                        </label>
                        <div className="mt-1 text-sm text-gray-900">
                          {new Date(formData.date).toLocaleDateString()}
                        </div>
                      </div>

                      {formData.from_account_id && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            From Account
                          </label>
                          <div className="mt-1 text-sm text-gray-900">
                            {accounts.standard.find(
                              (a) => a.id === parseInt(formData.from_account_id)
                            )?.name ||
                              accounts.investment.find(
                                (a) =>
                                  a.id === parseInt(formData.from_account_id)
                              )?.name ||
                              `Account #${formData.from_account_id}`}
                          </div>
                        </div>
                      )}

                      {formData.to_account_id && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            To Account
                          </label>
                          <div className="mt-1 text-sm text-gray-900">
                            {accounts.standard.find(
                              (a) => a.id === parseInt(formData.to_account_id)
                            )?.name ||
                              accounts.investment.find(
                                (a) => a.id === parseInt(formData.to_account_id)
                              )?.name ||
                              accounts.loan.find(
                                (a) => a.id === parseInt(formData.to_account_id)
                              )?.name ||
                              accounts.credit.find(
                                (a) => a.id === parseInt(formData.to_account_id)
                              )?.name ||
                              `Account #${formData.to_account_id}`}
                          </div>
                        </div>
                      )}

                      {formData.description && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <div className="mt-1 text-sm text-gray-900">
                            {formData.description}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status - Editable */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="Created">Created</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Posted">Posted</option>
                        <option value="Pending">Pending</option>
                        <option value="Canceled">Canceled</option>
                      </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
