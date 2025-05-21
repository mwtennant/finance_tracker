// PlanContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// API base URL
const API_URL = "http://localhost:5002/api";

// Context for storing and accessing financial plan data across components
const PlanContext = createContext();

// Provider component that makes plan data available to any child component
export const PlanProvider = ({ children }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all plans
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/plans`);

      if (!response.ok) {
        // Handle specific status codes with more informative messages
        if (response.status === 500) {
          throw new Error(
            "Server error. The server might be down or experiencing issues."
          );
        } else if (response.status === 404) {
          throw new Error(
            "The plans endpoint was not found. API might have changed."
          );
        } else {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      }

      const data = await response.json();
      setPlans(data.data || []);
    } catch (err) {
      console.error("Error fetching plans:", err);
      // Set a more descriptive error message for the user
      setError(err.message || "Failed to load plans. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a single plan by ID
  const getPlan = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/plans/${id}`);

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 404) {
          setError(`The plan with ID ${id} was not found.`);
          return null;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      console.error(`Error fetching plan ${id}:`, err);

      if (err.message.includes("Failed to fetch")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to load plan details. Please try again later.");
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new plan
  const createPlan = async (planData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
        credentials: "include", // Include credentials for CORS
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      const data = await response.json();
      setPlans([...plans, data.data]);
      return data.data;
    } catch (err) {
      console.error("Error creating plan:", err);

      // Improved error handling with more specific messages
      if (err instanceof TypeError && err.message.includes("fetch")) {
        // Network error, likely CORS
        setError(
          "Failed to connect to the server. This might be a CORS issue or the server is down."
        );
      } else {
        setError(
          err.message || "Failed to create plan. Please try again later."
        );
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  // Link an account to a plan
  const linkAccountToPlan = async (planId, accountId, accountType) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/plans/${planId}/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountId, accountType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      const data = await response.json();
      // Refresh plan data to get updated linked accounts
      await fetchPlans();
      return data;
    } catch (err) {
      console.error(`Error linking account to plan ${planId}:`, err);
      setError("Failed to link account to plan. Please try again later.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Unlink an account from a plan
  const unlinkAccountFromPlan = async (planId, accountId, accountType) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/plans/${planId}/accounts`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountId, accountType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      const data = await response.json();
      // Refresh plan data to get updated linked accounts
      await fetchPlans();
      return data;
    } catch (err) {
      console.error(`Error unlinking account from plan ${planId}:`, err);
      setError("Failed to unlink account from plan. Please try again later.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load plans on initial render
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Add a setter for error to allow components to clear error state
  const clearError = () => setError(null);

  return (
    <PlanContext.Provider
      value={{
        plans,
        loading,
        error,
        setError, // Expose the error setter
        clearError, // Expose a dedicated function to clear errors
        getPlan,
        createPlan,
        linkAccountToPlan,
        unlinkAccountFromPlan,
        refreshPlans: fetchPlans,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

// Custom hook to use the plan context
export const usePlans = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlans must be used within a PlanProvider");
  }
  return context;
};

export default PlanContext;
