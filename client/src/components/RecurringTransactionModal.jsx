import React, { useState, useEffect } from "react";

const RecurringTransactionModal = ({ series, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    recurrence_type: "monthly",
    recurrence_interval: 1,
    start_date: "",
    end_date: "",
    update_scope: "future", // none, future, all
  });

  // Initialize form data when series changes
  useEffect(() => {
    if (series) {
      setFormData({
        name: series.name || "",
        description: series.description || "",
        recurrence_type: series.recurrence_type || "monthly",
        recurrence_interval: series.recurrence_interval || 1,
        start_date: series.start_date || new Date().toISOString().slice(0, 10),
        end_date: series.end_date || "",
        update_scope: "future",
      });
    }
  }, [series]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "recurrence_interval") {
      // Ensure it's a positive number
      const interval = parseInt(value, 10);
      if (!isNaN(interval) && interval > 0) {
        setFormData({ ...formData, [name]: interval });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5002/api/recurring-transactions/${series.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            recurrence_type: formData.recurrence_type,
            recurrence_interval: formData.recurrence_interval,
            start_date: formData.start_date,
            end_date: formData.end_date === "" ? null : formData.end_date,
            update_scope: formData.update_scope,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update recurring transaction"
        );
      }

      const data = await response.json();

      // Fetch the updated series with all details
      const detailsResponse = await fetch(
        `http://localhost:5002/api/recurring-transactions/${series.id}`
      );

      if (!detailsResponse.ok) {
        throw new Error("Failed to fetch updated series details");
      }

      const detailsData = await detailsResponse.json();

      // Call the onUpdate function with the updated series
      onUpdate(detailsData.data.series);
    } catch (err) {
      setError(
        err.message ||
          "Failed to update recurring transaction. Please try again."
      );
      console.error("Error updating recurring transaction:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle regenerate transactions
  const handleRegenerate = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5002/api/recurring-transactions/${series.id}/generate?regenerate_all=true`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to regenerate transactions"
        );
      }

      // Fetch the updated series with all details
      const detailsResponse = await fetch(
        `http://localhost:5002/api/recurring-transactions/${series.id}`
      );

      if (!detailsResponse.ok) {
        throw new Error("Failed to fetch updated series details");
      }

      const detailsData = await detailsResponse.json();

      // Call the onUpdate function with the updated series
      onUpdate(detailsData.data.series);

      // Show a success message
      alert("Transactions regenerated successfully!");
    } catch (err) {
      setError(
        err.message || "Failed to regenerate transactions. Please try again."
      );
      console.error("Error regenerating transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Recurring Transaction</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Series Name */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Series Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="description">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              rows="2"
            ></textarea>
          </div>

          {/* Recurrence Type */}
          <div className="mb-4">
            <label
              className="block text-gray-700 mb-2"
              htmlFor="recurrence_type"
            >
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
                className="w-20 p-2 border border-gray-300 rounded"
                required
              />
              <select
                id="recurrence_type"
                name="recurrence_type"
                value={formData.recurrence_type}
                onChange={handleChange}
                className="flex-1 p-2 border border-gray-300 rounded"
                required
              >
                <option value="daily">Day(s)</option>
                <option value="weekly">Week(s)</option>
                <option value="monthly">Month(s)</option>
                <option value="yearly">Year(s)</option>
              </select>
            </div>
          </div>

          {/* Start Date */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="start_date">
              Start Date
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          {/* End Date */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="end_date">
              End Date (Optional)
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <p className="text-gray-500 text-sm mt-1">
              Leave blank for indefinite recurring transactions
            </p>
          </div>

          {/* Update Scope */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Apply Changes To:
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="update_scope"
                  value="none"
                  checked={formData.update_scope === "none"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Series metadata only (no transaction changes)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="update_scope"
                  value="future"
                  checked={formData.update_scope === "future"}
                  onChange={handleChange}
                  className="mr-2"
                />
                This and all future transactions
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="update_scope"
                  value="all"
                  checked={formData.update_scope === "all"}
                  onChange={handleChange}
                  className="mr-2"
                />
                All transactions in this series
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleRegenerate}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
              disabled={loading}
            >
              Regenerate Transactions
            </button>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringTransactionModal;
