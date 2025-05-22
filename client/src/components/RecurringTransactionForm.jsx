import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RecurringTransactionForm = () => {
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
    // Transaction details
    transaction_type: "deposit",
    from_account_id: "",
    to_account_id: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10), // Today's date in YYYY-MM-DD format
    description: "",

    // Recurring details
    recurring_name: "",
    recurrence_type: "monthly",
    recurrence_interval: 1,
    start_date: new Date().toISOString().slice(0, 10), // Default to today
    end_date: "", // Optional
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
    } else if (name === "recurrence_interval") {
      // Ensure it's a positive number
      const interval = parseInt(value, 10);
      if (!isNaN(interval) && interval > 0) {
        setFormData({ ...formData, [name]: interval });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Check required fields for transaction
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

    // Check required fields for recurring details
    if (!formData.recurrence_type) {
      newErrors.recurrence_type = "Recurrence type is required";
    }

    if (
      !formData.recurrence_interval ||
      isNaN(formData.recurrence_interval) ||
      parseInt(formData.recurrence_interval, 10) <= 0
    ) {
      newErrors.recurrence_interval = "Interval must be a positive number";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    // If end date is provided, ensure it's after the start date
    if (formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        newErrors.end_date = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5002/api/recurring-transactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Series data
            name:
              formData.recurring_name ||
              `${formData.transaction_type} (${formData.recurrence_type})`,
            description: formData.description,
            recurrence_type: formData.recurrence_type,
            recurrence_interval: formData.recurrence_interval,
            start_date: formData.start_date,
            end_date: formData.end_date || null,

            // Template transaction data
            transaction_type: formData.transaction_type,
            from_account_id: formData.from_account_id || null,
            to_account_id: formData.to_account_id || null,
            amount: formData.amount,
            transaction_date: formData.date,
            transaction_description: formData.description,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to create recurring transaction"
        );
      }

      // Success - redirect to recurring transactions list
      navigate("/dashboard/transactions/recurring");
    } catch (err) {
      setError(
        err.message ||
          "Failed to create recurring transaction. Please try again."
      );
      console.error("Error creating recurring transaction:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get appropriate accounts list based on transaction type and field
  const getAccountOptions = (field) => {
    if (
      (field === "from_account_id" &&
        (formData.transaction_type === "withdraw" ||
          formData.transaction_type === "transfer" ||
          formData.transaction_type === "interest_paid")) ||
      (field === "to_account_id" &&
        (formData.transaction_type === "deposit" ||
          formData.transaction_type === "transfer" ||
          formData.transaction_type === "interest_earned"))
    ) {
      return standardAccounts;
    } else if (
      field === "to_account_id" &&
      formData.transaction_type === "loan_payment"
    ) {
      return loanAccounts;
    } else if (
      field === "to_account_id" &&
      (formData.transaction_type === "credit_card_spending" ||
        formData.transaction_type === "credit_card_payment")
    ) {
      return creditAccounts;
    }

    return [];
  };

  if (loading && !formData) {
    return <div className="text-center p-4">Loading accounts...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Create Recurring Transaction
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Transaction Type */}
        <div className="mb-4">
          <label
            className="block text-gray-700 mb-2"
            htmlFor="transaction_type"
          >
            Transaction Type
          </label>
          <select
            id="transaction_type"
            name="transaction_type"
            value={formData.transaction_type}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.transaction_type ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdrawal</option>
            <option value="transfer">Transfer</option>
            <option value="loan_payment">Loan Payment</option>
            <option value="interest_paid">Interest Paid</option>
            <option value="interest_earned">Interest Earned</option>
            <option value="credit_card_spending">Credit Card Spending</option>
            <option value="credit_card_payment">Credit Card Payment</option>
          </select>
          {errors.transaction_type && (
            <p className="text-red-500 text-sm mt-1">
              {errors.transaction_type}
            </p>
          )}
        </div>

        {/* From Account */}
        {["withdraw", "transfer", "interest_paid"].includes(
          formData.transaction_type
        ) && (
          <div className="mb-4">
            <label
              className="block text-gray-700 mb-2"
              htmlFor="from_account_id"
            >
              From Account
            </label>
            <select
              id="from_account_id"
              name="from_account_id"
              value={formData.from_account_id}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.from_account_id ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select an account</option>
              {getAccountOptions("from_account_id").map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} (${account.balance})
                </option>
              ))}
            </select>
            {errors.from_account_id && (
              <p className="text-red-500 text-sm mt-1">
                {errors.from_account_id}
              </p>
            )}
          </div>
        )}

        {/* To Account */}
        {[
          "deposit",
          "transfer",
          "loan_payment",
          "interest_earned",
          "credit_card_spending",
          "credit_card_payment",
        ].includes(formData.transaction_type) && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="to_account_id">
              To Account
            </label>
            <select
              id="to_account_id"
              name="to_account_id"
              value={formData.to_account_id}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.to_account_id ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select an account</option>
              {getAccountOptions("to_account_id").map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                  {account.balance !== undefined && ` ($${account.balance})`}
                </option>
              ))}
            </select>
            {errors.to_account_id && (
              <p className="text-red-500 text-sm mt-1">
                {errors.to_account_id}
              </p>
            )}
          </div>
        )}

        {/* Amount */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="amount">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.amount ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="0.00"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="date">
            First Transaction Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.date ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            rows="2"
            placeholder="Add a description (optional)"
          ></textarea>
        </div>

        <hr className="my-6 border-gray-200" />

        <h3 className="text-xl font-bold mb-4">Recurring Details</h3>

        {/* Recurring Name */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="recurring_name">
            Series Name (Optional)
          </label>
          <input
            type="text"
            id="recurring_name"
            name="recurring_name"
            value={formData.recurring_name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="E.g., 'Monthly Rent' or 'Salary Deposit'"
          />
        </div>

        {/* Recurrence Type */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="recurrence_type">
            Repeat Every
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              id="recurrence_interval"
              name="recurrence_interval"
              min="1"
              value={formData.recurrence_interval}
              onChange={handleChange}
              className={`w-20 p-2 border rounded ${
                errors.recurrence_interval
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <select
              id="recurrence_type"
              name="recurrence_type"
              value={formData.recurrence_type}
              onChange={handleChange}
              className={`flex-1 p-2 border rounded ${
                errors.recurrence_type ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="daily">Day(s)</option>
              <option value="weekly">Week(s)</option>
              <option value="monthly">Month(s)</option>
              <option value="yearly">Year(s)</option>
            </select>
          </div>
          {errors.recurrence_interval && (
            <p className="text-red-500 text-sm mt-1">
              {errors.recurrence_interval}
            </p>
          )}
          {errors.recurrence_type && (
            <p className="text-red-500 text-sm mt-1">
              {errors.recurrence_type}
            </p>
          )}
        </div>

        {/* Start Date */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="start_date">
            Series Start Date
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.start_date ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.start_date && (
            <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
          )}
        </div>

        {/* End Date */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="end_date">
            Series End Date (Optional)
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.end_date ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.end_date && (
            <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            Leave blank for indefinite recurring transactions
          </p>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Recurring Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecurringTransactionForm;
