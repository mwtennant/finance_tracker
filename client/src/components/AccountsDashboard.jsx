// AccountsDashboard.jsx
import React, { useState } from "react";
import AccountList from "./AccountList";

const AccountsDashboard = () => {
  const [activeTab, setActiveTab] = useState("standard");

  const tabs = [
    { id: "standard", label: "Accounts" },
    { id: "credit", label: "Credit Cards" },
    { id: "loan", label: "Loans" },
    { id: "investment", label: "Investments" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Accounts Management</h1>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mt-8">
        <AccountList accountType={activeTab} />
      </div>
    </div>
  );
};

export default AccountsDashboard;
