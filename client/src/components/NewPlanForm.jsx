import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePlans } from "../context/PlanContext";

const NewPlanForm = () => {
  const navigate = useNavigate();
  const { createPlan, loading, error: contextError, setError } = usePlans();
  const [localError, setLocalError] = useState(null);

  // Clear any existing errors when component mounts
  useEffect(() => {
    // Clear context error on mount
    if (setError) {
      setError(null);
    }
  }, [setError]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    target_amount: "",
  });

  // Form validation state
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Plan name is required";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }

    // Date validation
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);

      if (startDate >= endDate) {
        newErrors.end_date = "End date must be after start date";
      }
    }

    // Target amount validation (if provided)
    if (formData.target_amount && isNaN(formData.target_amount)) {
      newErrors.target_amount = "Target amount must be a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (validateForm()) {
      try {
        // Format target_amount as a number if provided
        const planData = {
          ...formData,
          target_amount: formData.target_amount
            ? parseFloat(formData.target_amount)
            : null,
        };

        const createdPlan = await createPlan(planData);

        if (createdPlan && createdPlan.id) {
          // Redirect to the new plan's detail page
          navigate(`/plans/${createdPlan.id}`);
        } else {
          setLocalError("Failed to create plan. Please try again.");
        }
      } catch (err) {
        setLocalError(err.message || "An unexpected error occurred");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <Link
        to="/dashboard/plans"
        className="text-purple-600 hover:text-purple-800 mb-6 inline-block"
      >
        &larr; Back to All Plans
      </Link>

      <div className="bg-purple-50 rounded-xl p-8 shadow-md">
        <h2 className="text-2xl text-purple-700 font-bold mb-6">
          Create New Financial Plan
        </h2>

        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
          {(contextError || localError) && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {contextError || localError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 font-medium mb-2"
              >
                Plan Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Retirement Plan"
                disabled={loading}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-gray-700 font-medium mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-purple-500 outline-none transition"
                placeholder="A brief description of your financial plan"
                disabled={loading}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="start_date"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition ${
                    errors.start_date ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={loading}
                />
                {errors.start_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.start_date}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="end_date"
                  className="block text-gray-700 font-medium mb-2"
                >
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition ${
                    errors.end_date ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={loading}
                />
                {errors.end_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="target_amount"
                className="block text-gray-700 font-medium mb-2"
              >
                Target Amount
              </label>
              <input
                type="text"
                id="target_amount"
                name="target_amount"
                value={formData.target_amount}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition ${
                  errors.target_amount ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="100000"
                disabled={loading}
              />
              {errors.target_amount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.target_amount}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard/plans")}
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
                {loading ? "Creating..." : "Create Plan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPlanForm;
