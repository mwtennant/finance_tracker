import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import TransactionList from "./TransactionList";
import TransactionForm from "./TransactionForm";

const TransactionsDashboard = () => {
  const location = useLocation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-purple-700">Transactions</h1>
        <Link
          to="/dashboard/transactions/new"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-200 flex items-center"
        >
          <span className="mr-1">+</span> New Transaction
        </Link>
      </div>

      <Routes>
        <Route index element={<TransactionList />} />
        <Route path="/new" element={<TransactionForm />} />
      </Routes>
    </div>
  );
};

export default TransactionsDashboard;
