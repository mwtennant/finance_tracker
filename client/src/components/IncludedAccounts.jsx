import React from "react";

const IncludedAccounts = ({ fullPage }) => {
  // Dummy data
  const accounts = [
    { name: "Checking Account", balance: 3500 },
    { name: "Savings Account", balance: 12000 },
  ];

  return (
    <section
      className={`bg-purple-50 rounded-xl p-6 shadow-sm min-h-[120px] ${
        fullPage ? "col-span-2" : ""
      }`}
    >
      <h3 className="text-purple-600 text-lg font-semibold mb-2">
        Included Accounts
      </h3>
      <ul className="list-none p-0 m-0">
        {accounts.map((acc, i) => (
          <li key={i} className="mb-1 text-purple-900">
            {acc.name}:{" "}
            <span className="text-purple-700 font-semibold">
              ${acc.balance.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default IncludedAccounts;
