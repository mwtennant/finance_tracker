import React, { useState, useEffect, useMemo } from "react";

const PlanLedger = ({ plan, formatCurrency, onNavigateToAccountsTab }) => {
  const [ledgerData, setLedgerData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(30); // Default to 30 days
  const [visibleSections, setVisibleSections] = useState({
    standard: true,
    credit: true,
    loan: true,
    investment: true,
  });
  const [transactions, setTransactions] = useState([]);

  // Extract all accounts from the plan data
  const {
    accounts: standardAccounts = [],
    credit_accounts: creditAccounts = [],
    loans: loanAccounts = [],
    investment_accounts: investmentAccounts = [],
  } = plan || {};

  // Generate dates between start_date and end_date
  const generateDates = useMemo(() => {
    if (!plan?.start_date || !plan?.end_date) return [];

    const startDate = new Date(plan.start_date);
    const endDate = new Date(plan.end_date);
    const dates = [];

    // Loop through each day and add it to the dates array
    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      dates.push(new Date(date));
    }

    return dates;
  }, [plan?.start_date, plan?.end_date]);

  // Generate ledger data on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Get start and end dates from the plan
        if (!plan?.start_date || !plan?.end_date) return;

        const startDate = new Date(plan.start_date).toISOString().split("T")[0];
        const endDate = new Date(plan.end_date).toISOString().split("T")[0];

        const queryParams = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
          include_recurring: "true",
        });

        console.log(
          `Fetching transactions for period: ${startDate} to ${endDate}`
        );
        const response = await fetch(
          `http://localhost:5002/api/transactions?${queryParams}`,
          {
            signal: AbortSignal.timeout(8000), // 8 second timeout
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(
            `Fetched ${data.data?.length || 0} transactions for ledger`
          );
          setTransactions(data.data || []);

          if (!data.data || data.data.length === 0) {
            console.log(
              "No transactions found for this date range - using projected data only"
            );
          }
        } else {
          console.error(
            `Failed to fetch transactions: ${response.status} ${response.statusText}`
          );
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.error(
            "Transaction fetch timed out - server may be overloaded"
          );
        } else {
          console.error("Error fetching transactions:", error);
        }
      }
    };

    const generateLedgerData = async () => {
      setIsLoading(true);

      try {
        // Fetch transactions first
        await fetchTransactions();
        // If plan or dates not available, return
        if (!plan || !generateDates.length) {
          setLedgerData([]);
          return;
        }

        // For demo purposes, we'll generate synthetic data
        // In a real app, this would fetch from the backend
        const data = generateDates.map((date, index, datesArray) => {
          // Create a row for each date
          const row = {
            date: date,
            dayOfWeek: date.toLocaleDateString("en-US", { weekday: "long" }),
            isSunday: date.getDay() === 0,
            standardAccounts: {},
            creditAccounts: {},
            loanAccounts: {},
            investmentAccounts: {},
            totals: {
              standardBalance: 0,
              creditBalance: 0,
              loanBalance: 0,
              investmentBalance: 0,
              total: 0,
              projectedTotal: 0,
            },
          };

          // Generate account data for each standard account
          standardAccounts.forEach((account) => {
            // Get transactions for this account on this date
            const dayTransactions = transactions.filter(
              (t) =>
                (t.from_account_id === account.id ||
                  t.to_account_id === account.id) &&
                new Date(t.date).toDateString() === date.toDateString()
            );

            // Calculate daily balance based on previous day's balance plus transactions
            let calculatedBalance = 0;

            if (index === 0) {
              // For the first day, start with the account's current balance
              calculatedBalance = account.balance || 0;
            } else {
              // For subsequent days, use the previous day's balance
              calculatedBalance =
                data[index - 1].standardAccounts[account.id]?.balance ||
                account.balance ||
                0;
            }

            // Apply transactions for this day
            let dailyTransactionTotal = 0;
            let transactionsDetail = [];

            dayTransactions.forEach((transaction) => {
              // If money is coming into this account
              if (transaction.to_account_id === account.id) {
                calculatedBalance += transaction.amount;
                dailyTransactionTotal += transaction.amount;
                transactionsDetail.push({
                  id: transaction.id,
                  description: transaction.description || "Income",
                  amount: transaction.amount,
                  type: "incoming",
                });
              }
              // If money is going out of this account
              if (transaction.from_account_id === account.id) {
                calculatedBalance -= transaction.amount;
                dailyTransactionTotal -= transaction.amount;
                transactionsDetail.push({
                  id: transaction.id,
                  description: transaction.description || "Expense",
                  amount: -transaction.amount,
                  type: "outgoing",
                });
              }
            });

            // Apply interest only at the end of the month
            const isLastDayOfMonth =
              date.getMonth() !==
              new Date(date.getTime() + 24 * 60 * 60 * 1000).getMonth();

            let interestAmount = 0;

            if (isLastDayOfMonth && account.apr && calculatedBalance > 0) {
              // Apply monthly interest based on APR, only for positive balances
              const monthlyRate = account.apr / 100 / 12;
              interestAmount = calculatedBalance * monthlyRate;
              calculatedBalance += interestAmount;

              // Only add interest as a transaction if it's significant
              if (Math.abs(interestAmount) >= 0.01) {
                dailyTransactionTotal += interestAmount;
                transactionsDetail.push({
                  id: "interest-" + date.toISOString() + "-" + account.id,
                  description: "Interest Earned",
                  amount: interestAmount,
                  type: "interest",
                });
              }
            }

            row.standardAccounts[account.id] = {
              name: account.name,
              balance: calculatedBalance,
              transactions:
                dailyTransactionTotal !== 0 ? dailyTransactionTotal : null,
              transactionsDetail:
                transactionsDetail.length > 0 ? transactionsDetail : null,
              interestApplied: interestAmount !== 0 ? interestAmount : null,
            };

            row.totals.standardBalance += calculatedBalance;
          });

          // Generate account data for each credit account
          creditAccounts.forEach((account) => {
            // Get transactions for this account on this date
            const dayTransactions = transactions.filter(
              (t) =>
                (t.from_account_id === account.id ||
                  t.to_account_id === account.id) &&
                new Date(t.date).toDateString() === date.toDateString()
            );

            // Calculate daily balance based on previous day's balance plus transactions
            let calculatedBalance = 0;

            if (index === 0) {
              // For the first day, start with the account's current balance
              calculatedBalance = account.balance || 0;
            } else {
              // For subsequent days, use the previous day's balance
              calculatedBalance =
                data[index - 1].creditAccounts[account.id]?.balance ||
                account.balance ||
                0;
            }

            // Apply transactions for this day
            let dailyTransactionTotal = 0;
            let transactionsDetail = [];

            dayTransactions.forEach((transaction) => {
              // If money is coming into this account (payment to credit card)
              if (transaction.to_account_id === account.id) {
                calculatedBalance -= transaction.amount; // Reduces credit card balance
                dailyTransactionTotal -= transaction.amount;
                transactionsDetail.push({
                  id: transaction.id,
                  description: transaction.description || "Credit Card Payment",
                  amount: -transaction.amount,
                  type: "payment",
                });
              }
              // If money is going out of this account (spending with credit card)
              if (transaction.from_account_id === account.id) {
                calculatedBalance += transaction.amount; // Increases credit card balance
                dailyTransactionTotal += transaction.amount;
                transactionsDetail.push({
                  id: transaction.id,
                  description:
                    transaction.description || "Credit Card Spending",
                  amount: transaction.amount,
                  type: "spending",
                });
              }
            });

            // Apply interest only at the end of the month
            const isLastDayOfMonth =
              date.getMonth() !==
              new Date(date.getTime() + 24 * 60 * 60 * 1000).getMonth();

            let interestAmount = 0;

            if (
              isLastDayOfMonth &&
              account.interest_rate &&
              calculatedBalance > 0
            ) {
              // Apply monthly interest based on interest rate (only on positive balance = owed money)
              const monthlyRate = account.interest_rate / 100 / 12;
              interestAmount = calculatedBalance * monthlyRate;
              calculatedBalance += interestAmount;

              // Only add interest as a transaction if it's significant
              if (Math.abs(interestAmount) >= 0.01) {
                dailyTransactionTotal += interestAmount;
                transactionsDetail.push({
                  id: "interest-" + date.toISOString() + "-" + account.id,
                  description: "Interest Charged",
                  amount: interestAmount,
                  type: "interest",
                });
              }
            }

            row.creditAccounts[account.id] = {
              name: account.name,
              balance: calculatedBalance,
              transactions:
                dailyTransactionTotal !== 0 ? dailyTransactionTotal : null,
              transactionsDetail:
                transactionsDetail.length > 0 ? transactionsDetail : null,
              interestApplied: interestAmount !== 0 ? interestAmount : null,
            };

            row.totals.creditBalance += calculatedBalance;
          });

          // Generate account data for each loan account
          loanAccounts.forEach((account) => {
            // Get transactions for this account on this date
            const dayTransactions = transactions.filter(
              (t) =>
                (t.from_account_id === account.id ||
                  t.to_account_id === account.id) &&
                new Date(t.date).toDateString() === date.toDateString()
            );

            // Calculate daily balance based on previous day's balance plus transactions
            let calculatedBalance = 0;

            if (index === 0) {
              // For the first day, start with the account's current balance
              calculatedBalance = account.balance || 0;
            } else {
              // For subsequent days, use the previous day's balance
              calculatedBalance =
                data[index - 1].loanAccounts[account.id]?.balance ||
                account.balance ||
                0;
            }

            // Apply transactions for this day
            let dailyTransactionTotal = 0;
            let transactionsDetail = [];

            dayTransactions.forEach((transaction) => {
              // If money is coming into this account (loan disbursement - rare)
              if (transaction.to_account_id === account.id) {
                calculatedBalance += transaction.amount; // Increases loan balance
                dailyTransactionTotal += transaction.amount;
                transactionsDetail.push({
                  id: transaction.id,
                  description: transaction.description || "Loan Disbursement",
                  amount: transaction.amount,
                  type: "disbursement",
                });
              }
              // If money is going out of this account (loan payment)
              if (transaction.from_account_id === account.id) {
                // For loans, we assume this is a payment which reduces the principal
                calculatedBalance -= transaction.amount;
                dailyTransactionTotal -= transaction.amount;
                transactionsDetail.push({
                  id: transaction.id,
                  description: transaction.description || "Loan Payment",
                  amount: -transaction.amount,
                  type: "payment",
                });
              }
            });

            // Apply interest only at the end of the month
            const isLastDayOfMonth =
              date.getMonth() !==
              new Date(date.getTime() + 24 * 60 * 60 * 1000).getMonth();

            let interestAmount = 0;

            if (
              isLastDayOfMonth &&
              account.interest_rate &&
              calculatedBalance > 0
            ) {
              // Apply monthly interest based on interest rate
              const monthlyRate = account.interest_rate / 100 / 12;
              interestAmount = calculatedBalance * monthlyRate;
              calculatedBalance += interestAmount;

              // Only add interest as a transaction if it's significant
              if (Math.abs(interestAmount) >= 0.01) {
                dailyTransactionTotal += interestAmount;
                transactionsDetail.push({
                  id: "interest-" + date.toISOString() + "-" + account.id,
                  description: "Interest Charged",
                  amount: interestAmount,
                  type: "interest",
                });
              }
            }

            row.loanAccounts[account.id] = {
              name: account.name,
              balance: calculatedBalance,
              transactions:
                dailyTransactionTotal !== 0 ? dailyTransactionTotal : null,
              transactionsDetail:
                transactionsDetail.length > 0 ? transactionsDetail : null,
              interestApplied: interestAmount !== 0 ? interestAmount : null,
            };

            row.totals.loanBalance += calculatedBalance;
          });

          // Generate account data for each investment account
          investmentAccounts.forEach((account) => {
            // Get transactions for this account on this date
            const dayTransactions = transactions.filter(
              (t) =>
                (t.from_account_id === account.id ||
                  t.to_account_id === account.id) &&
                new Date(t.date).toDateString() === date.toDateString()
            );

            // Calculate daily balance based on previous day's balance plus transactions
            let calculatedBalance = 0;

            if (index === 0) {
              // For the first day, start with the account's current balance
              calculatedBalance = account.balance || 0;
            } else {
              // For subsequent days, use the previous day's balance
              calculatedBalance =
                data[index - 1].investmentAccounts[account.id]?.balance ||
                account.balance ||
                0;
            }

            // Apply transactions for this day
            let dailyTransactionTotal = 0;
            let transactionsDetail = [];

            dayTransactions.forEach((transaction) => {
              // If money is coming into this account (deposits, dividends)
              if (transaction.to_account_id === account.id) {
                calculatedBalance += transaction.amount;
                dailyTransactionTotal += transaction.amount;
                transactionsDetail.push({
                  id: transaction.id,
                  description: transaction.description || "Investment Deposit",
                  amount: transaction.amount,
                  type: "deposit",
                });
              }
              // If money is going out of this account (withdrawals)
              if (transaction.from_account_id === account.id) {
                calculatedBalance -= transaction.amount;
                dailyTransactionTotal -= transaction.amount;
                transactionsDetail.push({
                  id: transaction.id,
                  description:
                    transaction.description || "Investment Withdrawal",
                  amount: -transaction.amount,
                  type: "withdrawal",
                });
              }
            });

            // Apply growth/interest only at the end of the month
            const isLastDayOfMonth =
              date.getMonth() !==
              new Date(date.getTime() + 24 * 60 * 60 * 1000).getMonth();

            let growthAmount = 0;

            if (
              isLastDayOfMonth &&
              account.expected_return &&
              calculatedBalance > 0
            ) {
              // Apply monthly growth based on expected annual return
              const monthlyRate = account.expected_return / 100 / 12;
              growthAmount = calculatedBalance * monthlyRate;
              calculatedBalance += growthAmount;

              // Only add growth as a transaction if it's significant
              if (Math.abs(growthAmount) >= 0.01) {
                dailyTransactionTotal += growthAmount;
                transactionsDetail.push({
                  id: "growth-" + date.toISOString() + "-" + account.id,
                  description: "Investment Growth",
                  amount: growthAmount,
                  type: "growth",
                });
              }
            }

            row.investmentAccounts[account.id] = {
              name: account.name,
              balance: calculatedBalance,
              transactions:
                dailyTransactionTotal !== 0 ? dailyTransactionTotal : null,
              transactionsDetail:
                transactionsDetail.length > 0 ? transactionsDetail : null,
              growthApplied: growthAmount !== 0 ? growthAmount : null,
            };

            row.totals.investmentBalance += calculatedBalance;
          });

          // Calculate the total net worth
          row.totals.total =
            row.totals.standardBalance +
            row.totals.investmentBalance -
            row.totals.creditBalance -
            row.totals.loanBalance;

          // Simple projected total calculation
          // Using a growth factor based on the day number
          const daysIntoFuture = Math.floor(
            (date - new Date()) / (1000 * 60 * 60 * 24)
          );
          if (daysIntoFuture <= 0) {
            // For past or today, projected = actual
            row.totals.projectedTotal = row.totals.total;
          } else {
            // For future, project growth
            const growthFactor = 1 + 0.0001 * daysIntoFuture; // Simple growth model
            row.totals.projectedTotal = row.totals.total * growthFactor;
          }

          return row;
        });

        setLedgerData(data);
      } catch (error) {
        console.error("Error generating ledger data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    generateLedgerData();
  }, [
    plan,
    generateDates,
    standardAccounts,
    creditAccounts,
    loanAccounts,
    investmentAccounts,
    // Don't add transactions as a dependency to avoid infinite loops
  ]);

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  // Create a helper function to format transaction details with colorized info
  const renderTransactionDetails = (accountData) => {
    if (!accountData?.transactions) return "-";

    return (
      <div>
        <div className="text-gray-900">
          {formatCurrency(accountData.transactions)}
        </div>
        {accountData?.transactionsDetail &&
          accountData.transactionsDetail.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {accountData.transactionsDetail.map((t) => (
                <div
                  key={t.id}
                  className={`${
                    t.type === "interest" || t.type === "growth"
                      ? "text-yellow-600 font-medium"
                      : t.amount > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {t.description}: {formatCurrency(t.amount)}
                </div>
              ))}
            </div>
          )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-purple-600">
          <svg
            className="animate-spin h-8 w-8 mr-3 inline-block text-purple-600"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Generating ledger data...
        </div>
      </div>
    );
  }

  if (!ledgerData.length) {
    return (
      <div className="bg-yellow-50 p-6 rounded-xl text-center my-6">
        <p className="text-yellow-700">
          No ledger data available. Please ensure your plan has valid start and
          end dates.
        </p>
      </div>
    );
  }

  // Check if no accounts are linked to the plan
  const hasLinkedAccounts =
    standardAccounts.length > 0 ||
    creditAccounts.length > 0 ||
    loanAccounts.length > 0 ||
    investmentAccounts.length > 0;

  if (!hasLinkedAccounts) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h3 className="text-xl font-semibold text-purple-700 mb-4">
          Plan Ledger
        </h3>
        <div className="bg-yellow-50 p-6 rounded-lg text-center">
          <p className="text-yellow-700 mb-4">
            No accounts are linked to this plan yet. Add accounts to see the
            ledger projection.
          </p>
          <button
            onClick={onNavigateToAccountsTab}
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg"
          >
            Go to Accounts Tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
      <h3 className="text-xl font-semibold text-purple-700 mb-4">
        Plan Ledger
      </h3>
      <p className="text-gray-600 mb-6">
        This ledger shows daily financial projections for all accounts in your
        plan.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-1">
            Current Net Worth
          </h4>
          <p className="text-lg font-bold text-purple-700">
            {formatCurrency(
              ledgerData.find((row) => isToday(row.date))?.totals.total || 0
            )}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-1">
            Projected Final Value
          </h4>
          <p className="text-lg font-bold text-indigo-700">
            {formatCurrency(
              ledgerData[ledgerData.length - 1]?.totals.projectedTotal || 0
            )}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Total Days</h4>
          <p className="text-lg font-bold text-gray-700">{ledgerData.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-1">
            Growth Rate
          </h4>
          <p className="text-lg font-bold text-green-700">
            {(() => {
              if (ledgerData.length < 2) return "N/A";
              const firstTotal = ledgerData[0]?.totals.total || 0;
              const lastTotal =
                ledgerData[ledgerData.length - 1]?.totals.total || 0;
              if (firstTotal <= 0) return "N/A"; // Avoid division by zero or negative
              const growthRate = (lastTotal / firstTotal - 1) * 100;
              return growthRate.toFixed(2) + "%";
            })()}
          </p>
        </div>
      </div>

      {/* Section Visibility Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="text-sm text-gray-700 mr-2 flex items-center">
          Show accounts:
        </div>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={visibleSections.standard}
            onChange={() =>
              setVisibleSections((prev) => ({
                ...prev,
                standard: !prev.standard,
              }))
            }
            className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
          />
          <span className="ml-2 text-sm text-gray-700">Standard</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={visibleSections.credit}
            onChange={() =>
              setVisibleSections((prev) => ({ ...prev, credit: !prev.credit }))
            }
            className="form-checkbox h-4 w-4 text-red-600 transition duration-150 ease-in-out"
          />
          <span className="ml-2 text-sm text-gray-700">Credit</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={visibleSections.loan}
            onChange={() =>
              setVisibleSections((prev) => ({ ...prev, loan: !prev.loan }))
            }
            className="form-checkbox h-4 w-4 text-yellow-600 transition duration-150 ease-in-out"
          />
          <span className="ml-2 text-sm text-gray-700">Loans</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={visibleSections.investment}
            onChange={() =>
              setVisibleSections((prev) => ({
                ...prev,
                investment: !prev.investment,
              }))
            }
            className="form-checkbox h-4 w-4 text-green-600 transition duration-150 ease-in-out"
          />
          <span className="ml-2 text-sm text-gray-700">Investments</span>
        </label>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <div className="mb-2 sm:mb-0">
          <label className="text-sm text-gray-600 mr-2">Rows per page:</label>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing rows per page
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
            <option value={ledgerData.length}>All days</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center mb-2 sm:mb-0">
          <label className="text-sm text-gray-600 mr-2">Jump to date:</label>
          <input
            type="date"
            min={plan?.start_date ? plan.start_date.split("T")[0] : ""}
            max={plan?.end_date ? plan.end_date.split("T")[0] : ""}
            onChange={(e) => {
              if (!e.target.value) return;

              // Find the index of the selected date in ledgerData
              const selectedDate = new Date(e.target.value);
              const index = ledgerData.findIndex((row) => {
                const rowDate = new Date(row.date);
                return (
                  rowDate.getFullYear() === selectedDate.getFullYear() &&
                  rowDate.getMonth() === selectedDate.getMonth() &&
                  rowDate.getDate() === selectedDate.getDate()
                );
              });

              if (index !== -1) {
                // Calculate which page contains this date
                const page = Math.floor(index / rowsPerPage) + 1;
                setCurrentPage(page);
              }
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <button
            onClick={() => {
              // Find today's date in the ledger data
              const today = new Date();
              const index = ledgerData.findIndex((row) => {
                const rowDate = new Date(row.date);
                return (
                  rowDate.getFullYear() === today.getFullYear() &&
                  rowDate.getMonth() === today.getMonth() &&
                  rowDate.getDate() === today.getDate()
                );
              });

              if (index !== -1) {
                // Calculate which page contains today's date
                const page = Math.floor(index / rowsPerPage) + 1;
                setCurrentPage(page);
              }
            }}
            className="ml-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-1 px-3 rounded text-sm"
          >
            Today
          </button>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded mr-1 ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-purple-600 hover:bg-purple-100"
            }`}
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded mr-1 ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-purple-600 hover:bg-purple-100"
            }`}
          >
            Prev
          </button>

          <span className="mx-2 text-sm">
            Page {currentPage} of {Math.ceil(ledgerData.length / rowsPerPage)}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, Math.ceil(ledgerData.length / rowsPerPage))
              )
            }
            disabled={currentPage >= Math.ceil(ledgerData.length / rowsPerPage)}
            className={`px-3 py-1 rounded mr-1 ${
              currentPage >= Math.ceil(ledgerData.length / rowsPerPage)
                ? "text-gray-400 cursor-not-allowed"
                : "text-purple-600 hover:bg-purple-100"
            }`}
          >
            Next
          </button>
          <button
            onClick={() =>
              setCurrentPage(Math.ceil(ledgerData.length / rowsPerPage))
            }
            disabled={currentPage >= Math.ceil(ledgerData.length / rowsPerPage)}
            className={`px-3 py-1 rounded ${
              currentPage >= Math.ceil(ledgerData.length / rowsPerPage)
                ? "text-gray-400 cursor-not-allowed"
                : "text-purple-600 hover:bg-purple-100"
            }`}
          >
            Last
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {/* Basic date columns */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>

                  {/* Standard Accounts */}
                  {standardAccounts.length > 0 && visibleSections.standard && (
                    <>
                      {standardAccounts.map((account) => (
                        <React.Fragment key={`standard-${account.id}`}>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {account.name} Balance
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {account.name} Transactions
                          </th>
                        </React.Fragment>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                        Total Standard
                      </th>
                    </>
                  )}

                  {/* Credit Accounts */}
                  {creditAccounts.length > 0 && visibleSections.credit && (
                    <>
                      {creditAccounts.map((account) => (
                        <React.Fragment key={`credit-${account.id}`}>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {account.name} Balance
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {account.name} Transactions
                          </th>
                        </React.Fragment>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-red-50">
                        Total Credit
                      </th>
                    </>
                  )}

                  {/* Loan Accounts */}
                  {loanAccounts.length > 0 && visibleSections.loan && (
                    <>
                      {loanAccounts.map((account) => (
                        <React.Fragment key={`loan-${account.id}`}>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {account.name} Balance
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {account.name} Transactions
                          </th>
                        </React.Fragment>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-50">
                        Total Loan
                      </th>
                    </>
                  )}

                  {/* Investment Accounts */}
                  {investmentAccounts.length > 0 &&
                    visibleSections.investment && (
                      <>
                        {investmentAccounts.map((account) => (
                          <React.Fragment key={`investment-${account.id}`}>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {account.name} Balance
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {account.name} Transactions
                            </th>
                          </React.Fragment>
                        ))}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">
                          Total Investment
                        </th>
                      </>
                    )}

                  {/* Final Summary Columns */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-purple-100">
                    Total Net Worth
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-indigo-100 group relative">
                    <div className="flex items-center">
                      Projected Total
                      <svg
                        className="h-4 w-4 ml-1 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="hidden group-hover:block absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg -right-16 -top-20">
                        Projected total represents the expected final balance
                        for the plan as of that day.
                        <br />
                        <br />
                        For dates before today, this matches the actual total.
                        <br />
                        <br />
                        For future dates, it reflects predicted growth based on
                        current data.
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ledgerData
                  .slice(
                    (currentPage - 1) * rowsPerPage,
                    currentPage * rowsPerPage
                  )
                  .map((row, index) => (
                    <tr
                      key={index}
                      className={`
                      ${
                        isToday(row.date)
                          ? "bg-indigo-50 border-l-4 border-indigo-400"
                          : row.isSunday
                          ? "bg-purple-50"
                          : ""
                      }
                    `}
                    >
                      {/* Date */}
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(row.date)}
                      </td>

                      {/* Day of Week */}
                      <td
                        className={`px-4 py-2 whitespace-nowrap text-sm ${
                          row.isSunday
                            ? "font-bold text-purple-700"
                            : "text-gray-900"
                        }`}
                      >
                        {row.dayOfWeek}
                      </td>

                      {/* Standard Accounts */}
                      {standardAccounts.length > 0 &&
                        visibleSections.standard && (
                          <>
                            {standardAccounts.map((account) => {
                              const accountData =
                                row.standardAccounts[account.id];
                              const isNegative = accountData?.balance < 0;

                              return (
                                <React.Fragment
                                  key={`standard-data-${account.id}`}
                                >
                                  <td
                                    className={`px-4 py-2 whitespace-nowrap text-sm ${
                                      isNegative
                                        ? "text-red-600 font-semibold"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {formatCurrency(accountData?.balance || 0)}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    {renderTransactionDetails(accountData)}
                                  </td>
                                </React.Fragment>
                              );
                            })}
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium bg-blue-50">
                              {formatCurrency(row.totals.standardBalance)}
                            </td>
                          </>
                        )}

                      {/* Credit Accounts */}
                      {creditAccounts.length > 0 && visibleSections.credit && (
                        <>
                          {creditAccounts.map((account) => {
                            const accountData = row.creditAccounts[account.id];
                            const isHigh =
                              accountData?.balance > account.balance * 1.2;

                            return (
                              <React.Fragment key={`credit-data-${account.id}`}>
                                <td
                                  className={`px-4 py-2 whitespace-nowrap text-sm ${
                                    isHigh
                                      ? "text-red-600 font-semibold"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {formatCurrency(accountData?.balance || 0)}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  {renderTransactionDetails(accountData)}
                                </td>
                              </React.Fragment>
                            );
                          })}
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium bg-red-50">
                            {formatCurrency(row.totals.creditBalance)}
                          </td>
                        </>
                      )}

                      {/* Loan Accounts */}
                      {loanAccounts.length > 0 && visibleSections.loan && (
                        <>
                          {loanAccounts.map((account) => {
                            const accountData = row.loanAccounts[account.id];

                            return (
                              <React.Fragment key={`loan-data-${account.id}`}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                  {formatCurrency(accountData?.balance || 0)}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  {renderTransactionDetails(accountData)}
                                </td>
                              </React.Fragment>
                            );
                          })}
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium bg-yellow-50">
                            {formatCurrency(row.totals.loanBalance)}
                          </td>
                        </>
                      )}

                      {/* Investment Accounts */}
                      {investmentAccounts.length > 0 &&
                        visibleSections.investment && (
                          <>
                            {investmentAccounts.map((account) => {
                              const accountData =
                                row.investmentAccounts[account.id];

                              return (
                                <React.Fragment
                                  key={`investment-data-${account.id}`}
                                >
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {formatCurrency(accountData?.balance || 0)}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    {renderTransactionDetails(accountData)}
                                  </td>
                                </React.Fragment>
                              );
                            })}
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium bg-green-50">
                              {formatCurrency(row.totals.investmentBalance)}
                            </td>
                          </>
                        )}

                      {/* Final Summary Columns */}
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-bold bg-purple-100">
                        {formatCurrency(row.totals.total)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-bold bg-indigo-100">
                        {formatCurrency(row.totals.projectedTotal)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Legend:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-50 mr-2"></div>
            <span className="text-xs text-gray-600">Sundays</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-indigo-50 border-l-4 border-indigo-400 mr-2"></div>
            <span className="text-xs text-gray-600">Today's Date</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-600 mr-2"></div>
            <span className="text-xs text-gray-600">
              Negative/High Balances
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-50 mr-2"></div>
            <span className="text-xs text-gray-600">
              Standard Account Totals
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-50 mr-2"></div>
            <span className="text-xs text-gray-600">Credit Account Totals</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-50 mr-2"></div>
            <span className="text-xs text-gray-600">Loan Account Totals</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-50 mr-2"></div>
            <span className="text-xs text-gray-600">
              Investment Account Totals
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-100 mr-2"></div>
            <span className="text-xs text-gray-600">Total Net Worth</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-indigo-100 mr-2"></div>
            <span className="text-xs text-gray-600">Projected Total</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 text-yellow-600 font-medium mr-2">◆</div>
            <span className="text-xs text-gray-600">Interest Transactions</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 text-green-600 mr-2">◆</div>
            <span className="text-xs text-gray-600">Positive Transactions</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 text-red-600 mr-2">◆</div>
            <span className="text-xs text-gray-600">Negative Transactions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanLedger;
