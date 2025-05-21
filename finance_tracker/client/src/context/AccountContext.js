// AccountContext.js
import { createContext, useState, useEffect, useCallback } from "react";

const API_URL = "http://localhost:5002/api";

export const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
  const [standardAccounts, setStandardAccounts] = useState([]);
  const [creditAccounts, setCreditAccounts] = useState([]);
  const [loans, setLoans] = useState([]);
  const [investmentAccounts, setInvestmentAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all accounts
  const fetchAllAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch standard accounts
      const standardResponse = await fetch(`${API_URL}/accounts`);
      if (!standardResponse.ok) {
        throw new Error(
          `Failed to fetch standard accounts: ${standardResponse.statusText}`
        );
      }
      const standardData = await standardResponse.json();
      setStandardAccounts(standardData.data);

      // Fetch credit accounts
      const creditResponse = await fetch(`${API_URL}/credit-accounts`);
      if (!creditResponse.ok) {
        throw new Error(
          `Failed to fetch credit accounts: ${creditResponse.statusText}`
        );
      }
      const creditData = await creditResponse.json();
      setCreditAccounts(creditData.data);

      // Fetch loans
      const loansResponse = await fetch(`${API_URL}/loans`);
      if (!loansResponse.ok) {
        throw new Error(`Failed to fetch loans: ${loansResponse.statusText}`);
      }
      const loansData = await loansResponse.json();
      setLoans(loansData.data);

      // Fetch investment accounts
      const investmentResponse = await fetch(`${API_URL}/investment-accounts`);
      if (!investmentResponse.ok) {
        throw new Error(
          `Failed to fetch investment accounts: ${investmentResponse.statusText}`
        );
      }
      const investmentData = await investmentResponse.json();
      setInvestmentAccounts(investmentData.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a standard account
  const createStandardAccount = async (accountData) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to create standard account"
        );
      }

      const data = await response.json();
      setStandardAccounts((prevAccounts) => [...prevAccounts, data.data]);
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Create a credit account
  const createCreditAccount = async (accountData) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/credit-accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create credit account");
      }

      const data = await response.json();
      setCreditAccounts((prevAccounts) => [...prevAccounts, data.data]);
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Create a loan
  const createLoan = async (loanData) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/loans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loanData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create loan");
      }

      const data = await response.json();
      setLoans((prevLoans) => [...prevLoans, data.data]);
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Create an investment account
  const createInvestmentAccount = async (accountData) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/investment-accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to create investment account"
        );
      }

      const data = await response.json();
      setInvestmentAccounts((prevAccounts) => [...prevAccounts, data.data]);
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update a standard account
  const updateStandardAccount = async (id, accountData) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/accounts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update standard account"
        );
      }

      const data = await response.json();
      setStandardAccounts((prevAccounts) =>
        prevAccounts.map((account) => (account.id === id ? data.data : account))
      );
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update a credit account
  const updateCreditAccount = async (id, accountData) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/credit-accounts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update credit account");
      }

      const data = await response.json();
      setCreditAccounts((prevAccounts) =>
        prevAccounts.map((account) => (account.id === id ? data.data : account))
      );
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update a loan
  const updateLoan = async (id, loanData) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/loans/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loanData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update loan");
      }

      const data = await response.json();
      setLoans((prevLoans) =>
        prevLoans.map((loan) => (loan.id === id ? data.data : loan))
      );
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update an investment account
  const updateInvestmentAccount = async (id, accountData) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/investment-accounts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update investment account"
        );
      }

      const data = await response.json();
      setInvestmentAccounts((prevAccounts) =>
        prevAccounts.map((account) => (account.id === id ? data.data : account))
      );
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete a standard account
  const deleteStandardAccount = async (id) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/accounts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to delete standard account"
        );
      }

      setStandardAccounts((prevAccounts) =>
        prevAccounts.filter((account) => account.id !== id)
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete a credit account
  const deleteCreditAccount = async (id) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/credit-accounts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete credit account");
      }

      setCreditAccounts((prevAccounts) =>
        prevAccounts.filter((account) => account.id !== id)
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete a loan
  const deleteLoan = async (id) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/loans/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete loan");
      }

      setLoans((prevLoans) => prevLoans.filter((loan) => loan.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete an investment account
  const deleteInvestmentAccount = async (id) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/investment-accounts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to delete investment account"
        );
      }

      setInvestmentAccounts((prevAccounts) =>
        prevAccounts.filter((account) => account.id !== id)
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Link an account to a plan
  const linkAccountToPlan = async (planId, accountId, accountType) => {
    setError(null);
    try {
      const accountTypeMap = {
        standard: "standard",
        credit: "credit",
        loan: "loan",
        investment: "investment",
      };

      const response = await fetch(`${API_URL}/plans/${planId}/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          accountType: accountTypeMap[accountType],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to link account to plan");
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Unlink an account from a plan
  const unlinkAccountFromPlan = async (planId, accountId, accountType) => {
    setError(null);
    try {
      const accountTypeMap = {
        standard: "standard",
        credit: "credit",
        loan: "loan",
        investment: "investment",
      };

      const response = await fetch(`${API_URL}/plans/${planId}/accounts`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          accountType: accountTypeMap[accountType],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to unlink account from plan"
        );
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Load all accounts on mount
  useEffect(() => {
    fetchAllAccounts();
  }, [fetchAllAccounts]);

  return (
    <AccountContext.Provider
      value={{
        standardAccounts,
        creditAccounts,
        loans,
        investmentAccounts,
        loading,
        error,
        fetchAllAccounts,
        createStandardAccount,
        createCreditAccount,
        createLoan,
        createInvestmentAccount,
        updateStandardAccount,
        updateCreditAccount,
        updateLoan,
        updateInvestmentAccount,
        deleteStandardAccount,
        deleteCreditAccount,
        deleteLoan,
        deleteInvestmentAccount,
        linkAccountToPlan,
        unlinkAccountFromPlan,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
