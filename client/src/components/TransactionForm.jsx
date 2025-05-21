import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TransactionForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // States for accounts
  const [standardAccounts, setStandardAccounts] = useState([]);
  const [creditAccounts, setCreditAccounts] = useState([]);
  const [loanAccounts, setLoanAccounts] = useState([]);
  const [investmentAccounts, setInvestmentAccounts] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    transaction_type: "deposit",
    from_account_id: "",
    to_account_id: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10), // Today's date in YYYY-MM-DD format
    status: "Created",
    description: "",
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Fetch accounts on component mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);

        // Fetch standard accounts
        const standardRes = await fetch("http://localhost:5002/api/accounts");
        if (standardRes.ok) {
          const data = await standardRes.json();
          setStandardAccounts(data.data || []);
        }

        // Fetch credit accounts
        const creditRes = await fetch(
          "http://localhost:5002/api/credit-accounts"
        );
        if (creditRes.ok) {
          const data = await creditRes.json();
          setCreditAccounts(data.data || []);
        }

        // Fetch loans
        const loanRes = await fetch("http://localhost:5002/api/loans");
        if (loanRes.ok) {
          const data = await loanRes.json();
          setLoanAccounts(data.data || []);
        }

        // Fetch investment accounts
        const investmentRes = await fetch(
          "http://localhost:5002/api/investment-accounts"
        );
        if (investmentRes.ok) {
          const data = await investmentRes.json();
          setInvestmentAccounts(data.data || []);
        }
      } catch (err) {
        setError("Failed to load accounts. Please try again later.");
        console.error("Error fetching accounts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear errors for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }

    // Handle special case for transaction type to reset form fields appropriately
    if (name === "transaction_type") {
      // Reset account selections when changing transaction type
      setFormData({
        ...formData,
        [name]: value,
        from_account_id: "",
        to_account_id: "",
        description: "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Check required fields
    if (!formData.transaction_type) {
      newErrors.transaction_type = "Transaction type is required";
    }

    if (
      !formData.amount ||
      isNaN(formData.amount) ||
      parseFloat(formData.amount) <= 0
    ) {
      newErrors.amount = "Amount must be a positive number";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    // Validate account fields based on transaction type
    if (
      formData.transaction_type === "deposit" ||
      formData.transaction_type === "interest_earned"
    ) {
      if (!formData.to_account_id) {
        newErrors.to_account_id = "To account is required for deposits";
      }
    } else if (
      formData.transaction_type === "withdraw" ||
      formData.transaction_type === "interest_paid"
    ) {
      if (!formData.from_account_id) {
        newErrors.from_account_id = "From account is required for withdrawals";
      }
    } else if (formData.transaction_type === "transfer") {
      if (!formData.from_account_id && !formData.to_account_id) {
        newErrors.from_account_id =
          "At least one account is required for transfers";
      }
    } else if (formData.transaction_type === "loan_payment") {
      if (!formData.to_account_id) {
        newErrors.to_account_id = "Loan account is required";
      }
    } else if (formData.transaction_type === "credit_card_spending") {
      if (!formData.to_account_id) {
        newErrors.to_account_id = "Credit card account is required";
      }
    } else if (formData.transaction_type === "credit_card_payment") {
      if (!formData.to_account_id) {
        newErrors.to_account_id = "Credit card account is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format data for API
      const apiData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      const response = await fetch("http://localhost:5002/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      const data = await response.json();

      // Redirect to transactions list
      navigate("/dashboard/transactions");
    } catch (err) {
      setError(
        err.message || "Failed to create transaction. Please try again."
      );
      console.error("Error creating transaction:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get relevant accounts based on transaction type
  const getFromAccountOptions = () => {
    switch (formData.transaction_type) {
      case "withdraw":
      case "transfer":
      case "loan_payment":
      case "interest_paid":
      case "credit_card_payment":
        return [...standardAccounts, ...investmentAccounts];
      default:
        return [];
    }
  };

  const getToAccountOptions = () => {
    switch (formData.transaction_type) {
      case "deposit":
      case "transfer":
      case "interest_earned":
        return [...standardAccounts, ...investmentAccounts];
      case "loan_payment":
        return loanAccounts;
      case "credit_card_spending":
      case "credit_card_payment":
        return creditAccounts;
      default:
        return [];
    }
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-purple-700 mb-6">
        Create New Transaction
      </h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Transaction Type */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Transaction Type <span className="text-red-500">*</span>
          </label>
          <select
            name="transaction_type"
            value={formData.transaction_type}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition ${
              errors.transaction_type ? "border-red-500" : "border-gray-300"
            }`}
            disabled={loading}
          >
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
            <option value="transfer">Transfer</option>
            <option value="loan_payment">Loan Payment</option>
            <option value="interest_paid">Interest - Paid</option>
            <option value="interest_earned">Interest - Earned</option>
            <option value="credit_card_spending">Credit Card Spending</option>
            <option value="credit_card_payment">Credit Card Payment</option>
          </select>
          {errors.transaction_type && (
            <p className="text-red-500 text-sm mt-1">
              {errors.transaction_type}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Amount */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                $
              </span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                className={`w-full p-3 pl-8 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition ${
                  errors.amount ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.00"
                disabled={loading}
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition ${
                errors.date ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* From Account - shown for appropriate transaction types */}
          {[
            "withdraw",
            "transfer",
            "loan_payment",
            "interest_paid",
            "credit_card_payment",
          ].includes(formData.transaction_type) && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                From Account{" "}
                {["withdraw", "interest_paid"].includes(
                  formData.transaction_type
                ) && <span className="text-red-500">*</span>}
              </label>
              <select
                name="from_account_id"
                value={formData.from_account_id}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition ${
                  errors.from_account_id ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              >
                <option value="">-- Select Account --</option>
                <optgroup label="Standard Accounts">
                  {standardAccounts.map((account) => (
                    <option key={`standard-${account.id}`} value={account.id}>
                      {account.name} ({formatCurrency(account.balance)})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Investment Accounts">
                  {investmentAccounts.map((account) => (
                    <option key={`investment-${account.id}`} value={account.id}>
                      {account.name} ({formatCurrency(account.balance)})
                    </option>
                  ))}
                </optgroup>
              </select>
              {errors.from_account_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.from_account_id}
                </p>
              )}
            </div>
          )}

          {/* To Account - shown for appropriate transaction types */}
          {[
            "deposit",
            "transfer",
            "loan_payment",
            "interest_earned",
            "credit_card_spending",
            "credit_card_payment",
          ].includes(formData.transaction_type) && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                To Account <span className="text-red-500">*</span>
              </label>
              <select
                name="to_account_id"
                value={formData.to_account_id}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition ${
                  errors.to_account_id ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              >
                <option value="">-- Select Account --</option>

                {/* Show standard accounts for deposit, transfer, or interest earned */}
                {["deposit", "transfer", "interest_earned"].includes(
                  formData.transaction_type
                ) && (
                  <>
                    <optgroup label="Standard Accounts">
                      {standardAccounts.map((account) => (
                        <option
                          key={`standard-${account.id}`}
                          value={account.id}
                        >
                          {account.name} ({formatCurrency(account.balance)})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Investment Accounts">
                      {investmentAccounts.map((account) => (
                        <option
                          key={`investment-${account.id}`}
                          value={account.id}
                        >
                          {account.name} ({formatCurrency(account.balance)})
                        </option>
                      ))}
                    </optgroup>
                  </>
                )}

                {/* Show loan accounts for loan payments */}
                {formData.transaction_type === "loan_payment" && (
                  <optgroup label="Loans">
                    {loanAccounts.map((loan) => (
                      <option key={`loan-${loan.id}`} value={loan.id}>
                        {loan.name} ({formatCurrency(loan.balance)})
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* Show credit accounts for credit card transactions */}
                {["credit_card_spending", "credit_card_payment"].includes(
                  formData.transaction_type
                ) && (
                  <optgroup label="Credit Cards">
                    {creditAccounts.map((card) => (
                      <option key={`credit-${card.id}`} value={card.id}>
                        {card.name} ({formatCurrency(card.balance)})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {errors.to_account_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.to_account_id}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Status - only show for specific transaction types */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
            disabled={loading}
          >
            <option value="Created">Created</option>

            {/* Show Scheduled only for future dates */}
            {new Date(formData.date) > new Date() && (
              <option value="Scheduled">Scheduled</option>
            )}

            {/* Show Posted/Pending/Canceled only for past or current dates */}
            {new Date(formData.date) <= new Date() && (
              <>
                <option value="Posted">Posted</option>
                <option value="Pending">Pending</option>
                <option value="Canceled">Canceled</option>
              </>
            )}
          </select>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Description{" "}
            {formData.transaction_type === "credit_card_spending" && (
              <span className="text-red-500">*</span>
            )}
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            rows="3"
            placeholder={
              formData.transaction_type === "credit_card_spending"
                ? "Enter 'Bulk-' for bulk spending or 'Individual-' for individual purchases"
                : "Enter transaction description"
            }
            disabled={loading}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}

          {formData.transaction_type === "credit_card_spending" && (
            <p className="text-sm text-gray-600 mt-1">
              For credit card spending, prefix with "Bulk-" for monthly spending
              or "Individual-" for specific purchases
            </p>
          )}
        </div>

        {/* Form Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/transactions")}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 rounded-lg text-white font-medium hover:bg-purple-700 transition"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
