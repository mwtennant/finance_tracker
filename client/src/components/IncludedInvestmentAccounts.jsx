import React from "react";

const IncludedInvestmentAccounts = ({ fullPage }) => {
  // Dummy data
  const investments = [
    { name: "401(k)", balance: 65000 },
    { name: "Roth IRA", balance: 18000 },
  ];

  return (
    <section
      className={`bg-purple-50 rounded-xl p-6 shadow-sm min-h-[120px] ${
        fullPage ? "col-span-2" : ""
      }`}
    >
      <h3 className="text-purple-600 text-lg font-semibold mb-2">
        Included Investment Accounts
      </h3>
      <ul className="list-none p-0 m-0">
        {investments.map((inv, i) => (
          <li key={i} className="mb-1 text-purple-900">
            {inv.name}:{" "}
            <span className="text-purple-700 font-semibold">
              ${inv.balance.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default IncludedInvestmentAccounts;
