import React from "react";
import IncludedAccounts from "./IncludedAccounts";
import IncludedLoans from "./IncludedLoans";
import IncludedCreditCards from "./IncludedCreditCards";
import IncludedInvestmentAccounts from "./IncludedInvestmentAccounts";

const Dashboard = ({ section = "accounts" }) => {
  return (
    <main className="max-w-3xl mx-auto mt-8 p-4">
      {section === "accounts" && <IncludedAccounts fullPage />}
      {section === "loans" && <IncludedLoans fullPage />}
      {section === "creditCards" && <IncludedCreditCards fullPage />}
      {section === "investmentAccounts" && (
        <IncludedInvestmentAccounts fullPage />
      )}
    </main>
  );
};

export default Dashboard;
