import React from "react";

const IncludedLoans = ({ fullPage }) => {
  // Dummy data
  const loans = [
    { name: "Car Loan", balance: 8000 },
    { name: "Student Loan", balance: 22000 },
  ];

  return (
    <section
      className={`bg-purple-50 rounded-xl p-6 shadow-sm min-h-[120px] ${
        fullPage ? "col-span-2" : ""
      }`}
    >
      <h3 className="text-purple-600 text-lg font-semibold mb-2">
        Included Loans
      </h3>
      <ul className="list-none p-0 m-0">
        {loans.map((loan, i) => (
          <li key={i} className="mb-1 text-purple-900">
            {loan.name}:{" "}
            <span className="text-purple-700 font-semibold">
              ${loan.balance.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default IncludedLoans;
