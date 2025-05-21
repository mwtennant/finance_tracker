import React from "react";

const IncludedCreditCards = ({ fullPage }) => {
  // Dummy data
  const cards = [
    { name: "Visa Platinum", balance: 1200 },
    { name: "MasterCard Rewards", balance: 500 },
  ];

  return (
    <section
      className={`bg-purple-50 rounded-xl p-6 shadow-sm min-h-[120px] ${
        fullPage ? "col-span-2" : ""
      }`}
    >
      <h3 className="text-purple-600 text-lg font-semibold mb-2">
        Included Credit Cards
      </h3>
      <ul className="list-none p-0 m-0">
        {cards.map((card, i) => (
          <li key={i} className="mb-1 text-purple-900">
            {card.name}:{" "}
            <span className="text-purple-700 font-semibold">
              ${card.balance.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default IncludedCreditCards;
