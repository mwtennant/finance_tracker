import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { usePlans } from "../context/PlanContext";

const PlanSummary = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { getPlan, deletePlan, loading, error } = usePlans();

  // Get the plan data from our central context
  const plan = getPlan(planId);

  const handleDelete = () => {
    // Delete the plan and navigate back to dashboard
    deletePlan(planId);
    navigate("/dashboard/plans");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-purple-600">Loading plan details...</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="bg-red-50 p-8 rounded-xl text-center">
        <h2 className="text-2xl text-red-600 mb-4">Plan Not Found</h2>
        <p className="mb-6">
          The plan you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/dashboard/plans"
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <Link
        to="/dashboard/plans"
        className="text-purple-600 hover:text-purple-800 mb-6 inline-block"
      >
        &larr; Back to All Plans
      </Link>

      <section className="bg-purple-100 rounded-2xl p-8 mb-8 shadow-md">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-purple-600 text-3xl font-bold">{plan.name}</h2>
          <div className="space-x-2">
            <Link
              to={`/plans/${planId}/edit`}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg inline-block"
            >
              Edit Plan
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
            >
              Delete Plan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-purple-600 font-semibold mb-1">Created</h3>
            <p className="text-lg">
              {new Date(plan.created).toLocaleDateString()}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-purple-600 font-semibold mb-1">Last Updated</h3>
            <p className="text-lg">
              {new Date(plan.lastUpdated).toLocaleDateString()}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-purple-600 font-semibold mb-1">
              Predicted Final Amount
            </h3>
            <p className="text-xl text-purple-700 font-bold">
              ${plan.target.toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* Plan Details Section */}
      <section className="bg-white rounded-xl p-6 mb-6 shadow-md">
        <h3 className="text-purple-700 text-xl font-semibold mb-4">
          Plan Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-700 font-medium">Description:</p>
            <p className="text-purple-900">{plan.description}</p>
          </div>
          <div>
            <p className="text-gray-700 font-medium">Current Savings:</p>
            <p className="text-purple-900">
              ${plan.currentSavings.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-700 font-medium">Monthly Contribution:</p>
            <p className="text-purple-900">
              ${plan.monthlyContribution.toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* Included Accounts Section */}
      {plan.includedAccounts && plan.includedAccounts.length > 0 && (
        <section className="bg-purple-50 rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="text-purple-700 text-xl font-semibold mb-4">
            Included Accounts
          </h3>
          <div className="divide-y divide-purple-200">
            {plan.includedAccounts.map((account) => (
              <div key={account.id} className="py-3 flex justify-between">
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-sm text-gray-600">Type: {account.type}</p>
                </div>
                <p className="font-semibold">
                  ${account.balance.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Included Loans Section */}
      {plan.includedLoans && plan.includedLoans.length > 0 && (
        <section className="bg-purple-50 rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="text-purple-700 text-xl font-semibold mb-4">
            Included Loans
          </h3>
          <div className="divide-y divide-purple-200">
            {plan.includedLoans.map((loan) => (
              <div key={loan.id} className="py-3 flex justify-between">
                <div>
                  <p className="font-medium">{loan.name}</p>
                  <p className="text-sm text-gray-600">
                    Interest Rate: {loan.interestRate}%
                  </p>
                </div>
                <p className="font-semibold">
                  ${loan.balance.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Credit Cards Section */}
      {plan.includedCreditCards && plan.includedCreditCards.length > 0 && (
        <section className="bg-purple-50 rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="text-purple-700 text-xl font-semibold mb-4">
            Included Credit Cards
          </h3>
          <div className="divide-y divide-purple-200">
            {plan.includedCreditCards.map((card) => (
              <div key={card.id} className="py-3 flex justify-between">
                <div>
                  <p className="font-medium">{card.name}</p>
                  <p className="text-sm text-gray-600">
                    Interest Rate: {card.interestRate}%
                  </p>
                </div>
                <p className="font-semibold">
                  ${card.balance.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Investment Accounts Section */}
      {plan.includedInvestmentAccounts &&
        plan.includedInvestmentAccounts.length > 0 && (
          <section className="bg-purple-50 rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="text-purple-700 text-xl font-semibold mb-4">
              Included Investment Accounts
            </h3>
            <div className="divide-y divide-purple-200">
              {plan.includedInvestmentAccounts.map((account) => (
                <div key={account.id} className="py-3 flex justify-between">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-gray-600">
                      Type: {account.type}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ${account.balance.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
    </div>
  );
};

export default PlanSummary;
