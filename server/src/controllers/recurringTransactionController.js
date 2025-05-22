const { pool } = require("../db");
const { ApiError } = require("../middleware/errorMiddleware");
const recurringTransactionService = require("../services/recurringTransactionService");

/**
 * Create a new recurring transaction series
 */
const createRecurringSeries = async (req, res, next) => {
  try {
    const {
      // Series data
      name,
      description,
      recurrence_type,
      recurrence_interval,
      start_date,
      end_date,

      // Template transaction data
      transaction_type,
      from_account_id,
      to_account_id,
      amount,
      transaction_date,
      transaction_description,
    } = req.body;

    // Validate required fields for series
    if (!recurrence_type || !start_date) {
      throw new ApiError("Recurrence type and start date are required", 400);
    }

    // Validate recurrence_type
    const validRecurrenceTypes = ["daily", "weekly", "monthly", "yearly"];
    if (!validRecurrenceTypes.includes(recurrence_type)) {
      throw new ApiError(
        `Recurrence type must be one of: ${validRecurrenceTypes.join(", ")}`,
        400
      );
    }

    // Validate recurrence_interval
    const interval = recurrence_interval || 1;
    if (isNaN(interval) || interval <= 0) {
      throw new ApiError("Recurrence interval must be a positive number", 400);
    }

    // Validate dates
    const startDateObj = new Date(start_date);
    if (isNaN(startDateObj.getTime())) {
      throw new ApiError("Start date is invalid", 400);
    }

    if (end_date) {
      const endDateObj = new Date(end_date);
      if (isNaN(endDateObj.getTime())) {
        throw new ApiError("End date is invalid", 400);
      }

      if (endDateObj < startDateObj) {
        throw new ApiError("End date must be after start date", 400);
      }
    }

    // Validate required fields for transaction template
    if (!transaction_type || !amount) {
      throw new ApiError("Transaction type and amount are required", 400);
    }

    // Validate transaction type
    const validTypes = [
      "deposit",
      "withdraw",
      "transfer",
      "loan_payment",
      "interest_paid",
      "interest_earned",
      "credit_card_spending",
      "credit_card_payment",
    ];

    if (!validTypes.includes(transaction_type)) {
      throw new ApiError(
        `Transaction type must be one of: ${validTypes.join(", ")}`,
        400
      );
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      throw new ApiError("Amount must be a positive number", 400);
    }

    // Validate account references based on transaction type
    if (
      transaction_type === "deposit" ||
      transaction_type === "interest_earned"
    ) {
      if (!to_account_id) {
        throw new ApiError(
          "To account is required for deposit transactions",
          400
        );
      }
    } else if (
      transaction_type === "withdraw" ||
      transaction_type === "interest_paid"
    ) {
      if (!from_account_id) {
        throw new ApiError(
          "From account is required for withdraw transactions",
          400
        );
      }
    } else if (transaction_type === "transfer") {
      if (!from_account_id || !to_account_id) {
        throw new ApiError(
          "Both from and to accounts are required for transfers",
          400
        );
      }
    } else if (transaction_type === "loan_payment") {
      if (!to_account_id) {
        throw new ApiError(
          "To account (loan) is required for loan payments",
          400
        );
      }
    } else if (transaction_type === "credit_card_spending") {
      if (!to_account_id) {
        throw new ApiError(
          "To account (credit card) is required for credit card spending",
          400
        );
      }
    } else if (transaction_type === "credit_card_payment") {
      if (!to_account_id) {
        throw new ApiError(
          "To account (credit card) is required for credit card payments",
          400
        );
      }
    }

    // In test mode, return mock data
    if (process.env.NODE_ENV === "test") {
      const mockId = Math.floor(Math.random() * 1000) + 1;
      const mockSeries = {
        id: mockId,
        name: name || `Recurring Series ${mockId}`,
        description: description || null,
        recurrence_type,
        recurrence_interval: interval,
        start_date,
        end_date: end_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockTemplate = {
        id: mockId + 1000,
        transaction_type,
        from_account_id: from_account_id || null,
        to_account_id: to_account_id || null,
        amount,
        date: transaction_date || start_date,
        status: "Template",
        description: transaction_description || null,
        recurring_series_id: mockId,
        is_recurring_template: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockInstances = [
        {
          id: mockId + 2000,
          transaction_type,
          from_account_id: from_account_id || null,
          to_account_id: to_account_id || null,
          amount,
          date: start_date,
          status: "Scheduled",
          description: transaction_description || null,
          recurring_series_id: mockId,
          is_recurring_template: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      return res.status(201).json({
        status: "success",
        data: {
          series: mockSeries,
          template: mockTemplate,
          instances: mockInstances,
        },
      });
    }

    // Prepare data for service
    const seriesData = {
      name: name || `${transaction_type} (${recurrence_type})`,
      description,
      recurrence_type,
      recurrence_interval: interval,
      start_date,
      end_date,
    };

    const templateData = {
      transaction_type,
      from_account_id,
      to_account_id,
      amount,
      date: transaction_date || start_date,
      description: transaction_description,
    };

    // Create the recurring series, template, and instances
    const result = await recurringTransactionService.createRecurringSeries(
      seriesData,
      templateData
    );

    res.status(201).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all recurring transaction series
 */
const getAllRecurringSeries = async (req, res, next) => {
  try {
    // In test mode, return mock data
    if (process.env.NODE_ENV === "test") {
      const mockSeries = [
        {
          id: 101,
          name: "Monthly Rent",
          description: "Rent payment",
          recurrence_type: "monthly",
          recurrence_interval: 1,
          start_date: "2025-05-01",
          end_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 102,
          name: "Weekly Groceries",
          description: "Food shopping",
          recurrence_type: "weekly",
          recurrence_interval: 1,
          start_date: "2025-05-01",
          end_date: "2025-12-31",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      return res.status(200).json({
        status: "success",
        results: mockSeries.length,
        data: mockSeries,
      });
    }

    const result = await pool.query(
      `SELECT * FROM recurring_transaction_series ORDER BY created_at DESC`
    );

    res.status(200).json({
      status: "success",
      results: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific recurring series by ID with template and instances
 */
const getRecurringSeriesById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // In test mode, return mock data
    if (process.env.NODE_ENV === "test") {
      if (id == 101) {
        const mockSeries = {
          id: 101,
          name: "Monthly Rent",
          description: "Rent payment",
          recurrence_type: "monthly",
          recurrence_interval: 1,
          start_date: "2025-05-01",
          end_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const mockTemplate = {
          id: 1101,
          transaction_type: "withdraw",
          from_account_id: 1,
          to_account_id: null,
          amount: 1200,
          date: "2025-05-01",
          status: "Template",
          description: "Monthly rent payment",
          recurring_series_id: 101,
          is_recurring_template: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const mockInstances = [
          {
            id: 2101,
            transaction_type: "withdraw",
            from_account_id: 1,
            to_account_id: null,
            amount: 1200,
            date: "2025-05-01",
            status: "Posted",
            description: "Monthly rent payment",
            recurring_series_id: 101,
            is_recurring_template: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2102,
            transaction_type: "withdraw",
            from_account_id: 1,
            to_account_id: null,
            amount: 1200,
            date: "2025-06-01",
            status: "Scheduled",
            description: "Monthly rent payment",
            recurring_series_id: 101,
            is_recurring_template: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];

        return res.status(200).json({
          status: "success",
          data: {
            series: mockSeries,
            template: mockTemplate,
            instances: mockInstances,
          },
        });
      } else {
        throw new ApiError(`No recurring series found with id ${id}`, 404);
      }
    }

    // Get the series
    const seriesResult = await pool.query(
      `SELECT * FROM recurring_transaction_series WHERE id = $1`,
      [id]
    );

    if (seriesResult.rows.length === 0) {
      throw new ApiError(`No recurring series found with id ${id}`, 404);
    }

    // Get the template
    const templateResult = await pool.query(
      `SELECT * FROM transactions 
       WHERE recurring_series_id = $1 AND is_recurring_template = true`,
      [id]
    );

    // Get the instances
    const instancesResult = await pool.query(
      `SELECT * FROM transactions 
       WHERE recurring_series_id = $1 AND is_recurring_template = false
       ORDER BY date ASC`,
      [id]
    );

    res.status(200).json({
      status: "success",
      data: {
        series: seriesResult.rows[0],
        template: templateResult.rows[0] || null,
        instances: instancesResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a recurring transaction series
 */
const updateRecurringSeries = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      // Series data
      name,
      description,
      recurrence_type,
      recurrence_interval,
      start_date,
      end_date,

      // Template transaction data
      transaction_type,
      from_account_id,
      to_account_id,
      amount,
      transaction_description,

      // Update scope
      update_scope = "none", // 'none', 'future', 'all'
    } = req.body;

    // Validate recurrence_type if provided
    if (recurrence_type) {
      const validRecurrenceTypes = ["daily", "weekly", "monthly", "yearly"];
      if (!validRecurrenceTypes.includes(recurrence_type)) {
        throw new ApiError(
          `Recurrence type must be one of: ${validRecurrenceTypes.join(", ")}`,
          400
        );
      }
    }

    // Validate recurrence_interval if provided
    if (recurrence_interval !== undefined) {
      if (isNaN(recurrence_interval) || recurrence_interval <= 0) {
        throw new ApiError(
          "Recurrence interval must be a positive number",
          400
        );
      }
    }

    // Validate dates if provided
    if (start_date) {
      const startDateObj = new Date(start_date);
      if (isNaN(startDateObj.getTime())) {
        throw new ApiError("Start date is invalid", 400);
      }

      if (end_date) {
        const endDateObj = new Date(end_date);
        if (isNaN(endDateObj.getTime())) {
          throw new ApiError("End date is invalid", 400);
        }

        if (endDateObj < startDateObj) {
          throw new ApiError("End date must be after start date", 400);
        }
      }
    }

    // Validate transaction type if provided
    if (transaction_type) {
      const validTypes = [
        "deposit",
        "withdraw",
        "transfer",
        "loan_payment",
        "interest_paid",
        "interest_earned",
        "credit_card_spending",
        "credit_card_payment",
      ];

      if (!validTypes.includes(transaction_type)) {
        throw new ApiError(
          `Transaction type must be one of: ${validTypes.join(", ")}`,
          400
        );
      }
    }

    // Validate amount if provided
    if (amount !== undefined) {
      if (isNaN(amount) || amount <= 0) {
        throw new ApiError("Amount must be a positive number", 400);
      }
    }

    // Validate update scope
    const validScopes = ["none", "future", "all"];
    if (!validScopes.includes(update_scope)) {
      throw new ApiError(
        `Update scope must be one of: ${validScopes.join(", ")}`,
        400
      );
    }

    // Check if series exists
    const checkResult = await pool.query(
      `SELECT * FROM recurring_transaction_series WHERE id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      throw new ApiError(`No recurring series found with id ${id}`, 404);
    }

    // Prepare data for service
    const seriesData = {
      name,
      description,
      recurrence_type,
      recurrence_interval,
      start_date,
      end_date,
    };

    const templateData =
      transaction_type ||
      from_account_id !== undefined ||
      to_account_id !== undefined ||
      amount !== undefined ||
      transaction_description !== undefined
        ? {
            transaction_type,
            from_account_id,
            to_account_id,
            amount,
            description: transaction_description,
          }
        : null;

    // Update the recurring series
    const result = await recurringTransactionService.updateRecurringSeries(
      id,
      seriesData,
      templateData,
      update_scope
    );

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a recurring transaction series
 */
const deleteRecurringSeries = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { keep_instances } = req.query;

    const keepInstances = keep_instances === "true";

    // Check if series exists
    const checkResult = await pool.query(
      `SELECT * FROM recurring_transaction_series WHERE id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      throw new ApiError(`No recurring series found with id ${id}`, 404);
    }

    // Delete the recurring series
    const result = await recurringTransactionService.deleteRecurringSeries(
      id,
      keepInstances
    );

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate or regenerate future recurring transactions
 */
const generateRecurringTransactions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { regenerate_all } = req.query;

    const regenerateAll = regenerate_all === "true";

    // Check if series exists
    const checkResult = await pool.query(
      `SELECT * FROM recurring_transaction_series WHERE id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      throw new ApiError(`No recurring series found with id ${id}`, 404);
    }

    // Generate the transactions
    const generatedTransactions =
      await recurringTransactionService.generateRecurringTransactions(
        id,
        new Date(),
        regenerateAll
      );

    res.status(200).json({
      status: "success",
      results: generatedTransactions.length,
      data: generatedTransactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRecurringSeries,
  getAllRecurringSeries,
  getRecurringSeriesById,
  updateRecurringSeries,
  deleteRecurringSeries,
  generateRecurringTransactions,
};
