import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { usePlans } from "../context/PlanContext";

const PlansDashboard = () => {
  // Using the plans context instead of local dummy data
  const { plans, loading, error, refreshPlans } = usePlans();

  // Refresh plans when component mounts
  useEffect(() => {
    refreshPlans();
  }, [refreshPlans]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-purple-700">
          Your Financial Plans
        </h1>
        <Link
          to="/plans/new"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          Add New Plan
        </Link>
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-xl text-purple-700">Loading plans...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12 bg-red-50 rounded-xl">
          <p className="text-xl text-red-700">Error loading plans: {error}</p>
        </div>
      )}

      {!loading && !error && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Link
              key={plan.id}
              to={`/plans/${plan.id}`}
              className="block bg-purple-50 hover:bg-purple-100 rounded-xl p-6 shadow-md transition duration-200"
            >
              <h2 className="text-xl font-bold text-purple-700 mb-2">
                {plan.name}
              </h2>
              <div className="text-purple-900">
                <p className="mb-1">Created: {formatDate(plan.created_at)}</p>
                <p className="mb-1">
                  Start Date: {formatDate(plan.start_date)}
                </p>
                <p className="mb-1">End Date: {formatDate(plan.end_date)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && plans.length === 0 && (
        <div className="text-center py-12 bg-purple-50 rounded-xl">
          <p className="text-xl text-purple-700">
            You don't have any financial plans yet.
          </p>
          <p className="text-gray-600 mt-2">
            Create your first plan to get started!
          </p>
        </div>
      )}
    </div>
  );
};

export default PlansDashboard;
