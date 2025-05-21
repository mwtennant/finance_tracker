// AccountForm.jsx
import React, { useState, useContext } from "react";
import { AccountContext } from "../context/AccountContext";

const AccountForm = ({
  accountType = "standard",
  initialData = null,
  onSave,
  onCancel,
}) => {
  const {
    createStandardAccount,
    createCreditAccount,
    createLoan,
    createInvestmentAccount,
    updateStandardAccount,
    updateCreditAccount,
    updateLoan,
    updateInvestmentAccount,
  } = useContext(AccountContext);

  // Set up initial form state based on account type and whether we're editing
  const getInitialFormState = () => {
    const isEditing = !!initialData;

    if (accountType === "standard") {
      return {
        name: isEditing ? initialData.name : "",
        type: isEditing ? initialData.type : "checking",
        balance: isEditing ? initialData.balance : 0,
        apr: isEditing ? initialData.apr || 0 : 0,
      };
    } else if (accountType === "credit") {
      return {
        name: isEditing ? initialData.name : "",
        balance: isEditing ? initialData.balance : 0,
        credit_limit: isEditing ? initialData.credit_limit : 0,
        interest_rate: isEditing ? initialData.interest_rate : 0,
      };
    } else if (accountType === "loan") {
      return {
        name: isEditing ? initialData.name : "",
        balance: isEditing ? initialData.balance : 0,
        interest_rate: isEditing ? initialData.interest_rate : 0,
        term_months: isEditing ? initialData.term_months : null,
      };
    } else if (accountType === "investment") {
      return {
        name: isEditing ? initialData.name : "",
        type: isEditing ? initialData.type : "ira",
        balance: isEditing ? initialData.balance : 0,
        targeted_rate: isEditing ? initialData.targeted_rate || 0 : 0,
      };
    }
  };

  const [formData, setFormData] = useState(getInitialFormState());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert numeric values
    if (
      [
        "balance",
        "credit_limit",
        "interest_rate",
        "term_months",
        "apr",
        "targeted_rate",
      ].includes(name)
    ) {
      setFormData({
        ...formData,
        [name]:
          value === "" && name === "term_months" ? null : parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const isEditing = !!initialData;
      let result;

      // Create or update account based on type
      if (accountType === "standard") {
        if (isEditing) {
          result = await updateStandardAccount(initialData.id, formData);
        } else {
          result = await createStandardAccount(formData);
        }
      } else if (accountType === "credit") {
        if (isEditing) {
          result = await updateCreditAccount(initialData.id, formData);
        } else {
          result = await createCreditAccount(formData);
        }
      } else if (accountType === "loan") {
        if (isEditing) {
          result = await updateLoan(initialData.id, formData);
        } else {
          result = await createLoan(formData);
        }
      } else if (accountType === "investment") {
        if (isEditing) {
          result = await updateInvestmentAccount(initialData.id, formData);
        } else {
          result = await createInvestmentAccount(formData);
        }
      }

      // Call the save callback with the result
      if (onSave) onSave(result);
    } catch (err) {
      setError(err.message || "Failed to save account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render different form fields based on account type
  const renderAccountTypeFields = () => {
    switch (accountType) {
      case "standard":
        return (
          <>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="type"
              >
                Account Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="apr"
              >
                APR (%)
              </label>
              <input
                type="number"
                id="apr"
                name="apr"
                value={formData.apr}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                min="0"
                step="0.01"
              />
            </div>
          </>
        );
      case "credit":
        return (
          <>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="credit_limit"
              >
                Credit Limit
              </label>
              <input
                type="number"
                id="credit_limit"
                name="credit_limit"
                value={formData.credit_limit}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                step="0.01"
                placeholder="Optional"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="interest_rate"
              >
                Interest Rate (%)
              </label>
              <input
                type="number"
                id="interest_rate"
                name="interest_rate"
                value={formData.interest_rate}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
                min="0"
                step="0.01"
              />
            </div>
          </>
        );
      case "loan":
        return (
          <>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="interest_rate"
              >
                Interest Rate (%)
              </label>
              <input
                type="number"
                id="interest_rate"
                name="interest_rate"
                value={formData.interest_rate}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="term_months"
              >
                Term (months)
              </label>
              <input
                type="number"
                id="term_months"
                name="term_months"
                value={
                  formData.term_months === null ? "" : formData.term_months
                }
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                min="1"
                step="1"
                placeholder="Optional"
              />
              <small className="text-gray-600">
                Leave empty for open-ended loans
              </small>
            </div>
          </>
        );
      case "investment":
        return (
          <>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="type"
              >
                Investment Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="ira">IRA</option>
                <option value="401k">401(k)</option>
                <option value="brokerage">Brokerage</option>
                <option value="stock">Stock</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="targeted_rate"
              >
                Targeted Annual Return Rate (%)
              </label>
              <input
                type="number"
                id="targeted_rate"
                name="targeted_rate"
                value={formData.targeted_rate}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                min="0"
                step="0.01"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Get form title based on account type and whether we're editing
  const getFormTitle = () => {
    const action = initialData ? "Edit" : "Add";
    switch (accountType) {
      case "standard":
        return `${action} Account`;
      case "credit":
        return `${action} Credit Card`;
      case "loan":
        return `${action} Loan`;
      case "investment":
        return `${action} Investment Account`;
      default:
        return `${action} Account`;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{getFormTitle()}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="balance"
          >
            Balance
          </label>
          <input
            type="number"
            id="balance"
            name="balance"
            value={formData.balance}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            step="0.01"
          />
        </div>

        {renderAccountTypeFields()}

        <div className="flex justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountForm;
