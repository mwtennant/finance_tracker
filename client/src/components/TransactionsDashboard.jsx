import React, { useState } from "react";
import { Routes, Route, useLocation, NavLink } from "react-router-dom";
import TransactionList from "./TransactionList";
import TransactionForm from "./TransactionForm";
import RecurringTransactionList from "./RecurringTransactionList";
import RecurringTransactionForm from "./RecurringTransactionForm";

const TransactionsDashboard = () => {
  const location = useLocation();
  const path = location.pathname;

  // Determine which tab is active
  const isRegularTab = !path.includes("/recurring");
  const isRecurringTab = path.includes("/recurring");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-purple-700 mb-6">Transactions</h1>

      {/* Navigation Tabs */}
      <div className="flex border-b mb-6">
        <NavLink
          to="/dashboard/transactions"
          end
          className={({ isActive }) =>
            `px-4 py-2 font-medium text-sm ${
              isRegularTab
                ? "border-b-2 border-purple-500 text-purple-700"
                : "text-gray-500 hover:text-gray-700"
            }`
          }
        >
          Single Transactions
        </NavLink>
        <NavLink
          to="/dashboard/transactions/recurring"
          className={({ isActive }) =>
            `px-4 py-2 font-medium text-sm ${
              isRecurringTab
                ? "border-b-2 border-purple-500 text-purple-700"
                : "text-gray-500 hover:text-gray-700"
            }`
          }
        >
          Recurring Transactions
        </NavLink>
      </div>

      <Routes>
        <Route index element={<TransactionList />} />
        <Route path="/new" element={<TransactionForm />} />
        <Route path="/recurring" element={<RecurringTransactionList />} />
        <Route path="/recurring/new" element={<RecurringTransactionForm />} />
      </Routes>
    </div>
  );
};

export default TransactionsDashboard;
