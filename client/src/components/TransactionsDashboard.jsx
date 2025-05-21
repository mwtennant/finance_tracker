import React from "react";

const TransactionsDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-purple-700">
          Your Transactions
        </h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
          Add New Transaction
        </button>
      </div>

      {/* Placeholder content for now */}
      <div className="bg-white rounded-xl p-8 shadow-md">
        <div className="text-center py-12">
          <p className="text-xl text-purple-700 mb-4">
            Transactions Dashboard Coming Soon
          </p>
          <p className="text-gray-600">
            This feature is under development. Check back soon for updates!
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransactionsDashboard;
