const { pool } = require("../db");
const { ApiError } = require("../middleware/errorMiddleware");

/**
 * Calculate the next occurrence dates for a recurring series
 * @param {Object} series - The recurring series object
 * @param {Date} startFrom - The date to start calculating from
 * @param {number} count - The number of occurrences to calculate
 * @returns {Array<Date>} - Array of occurrence dates
 */
const calculateOccurrences = (series, startFrom, count = 12) => {
  const { recurrence_type, recurrence_interval, start_date, end_date } = series;
  const dates = [];
  let currentDate = new Date(startFrom);

  // Ensure we're not starting before the series start date
  const seriesStartDate = new Date(start_date);
  if (currentDate < seriesStartDate) {
    currentDate = new Date(seriesStartDate);
  }

  const seriesEndDate = end_date ? new Date(end_date) : null;

  // Generate dates based on recurrence pattern
  for (let i = 0; i < count; i++) {
    let nextDate = new Date(currentDate);

    switch (recurrence_type) {
      case "daily":
        nextDate.setDate(nextDate.getDate() + recurrence_interval);
        break;
      case "weekly":
        nextDate.setDate(nextDate.getDate() + recurrence_interval * 7);
        break;
      case "monthly":
        // Handle special case for months with fewer days
        const targetDay = currentDate.getDate();
        nextDate.setMonth(nextDate.getMonth() + recurrence_interval);

        // Check if we landed on the correct day (handles month length differences)
        const daysInMonth = new Date(
          nextDate.getFullYear(),
          nextDate.getMonth() + 1,
          0
        ).getDate();
        if (targetDay > daysInMonth) {
          // If the target day doesn't exist in this month, use the last day of the month
          nextDate.setDate(daysInMonth);
        }
        break;
      case "yearly":
        nextDate.setFullYear(nextDate.getFullYear() + recurrence_interval);
        break;
      default:
        throw new Error(`Unknown recurrence type: ${recurrence_type}`);
    }

    // Stop if we've reached the end date
    if (seriesEndDate && nextDate > seriesEndDate) {
      break;
    }

    dates.push(nextDate);
    currentDate = nextDate;
  }

  return dates;
};

/**
 * Generate recurring transactions from a series
 * @param {number} seriesId - The ID of the recurring series
 * @param {Date} startFrom - The date to start generating from (defaults to today)
 * @param {boolean} regenerateAll - Whether to regenerate all future transactions
 * @returns {Promise<Array>} - The generated transactions
 */
const generateRecurringTransactions = async (
  seriesId,
  startFrom = new Date(),
  regenerateAll = false
) => {
  try {
    // Start a transaction
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Get the series and template transaction
      const seriesResult = await client.query(
        `SELECT * FROM recurring_transaction_series WHERE id = $1`,
        [seriesId]
      );

      if (seriesResult.rows.length === 0) {
        throw new ApiError(
          `No recurring series found with id ${seriesId}`,
          404
        );
      }

      const series = seriesResult.rows[0];

      // Get the template transaction
      const templateResult = await client.query(
        `SELECT * FROM transactions 
         WHERE recurring_series_id = $1 AND is_recurring_template = true`,
        [seriesId]
      );

      if (templateResult.rows.length === 0) {
        throw new ApiError(
          `No template transaction found for series ${seriesId}`,
          404
        );
      }

      const template = templateResult.rows[0];

      // 2. If regenerating, delete future transactions
      if (regenerateAll) {
        await client.query(
          `DELETE FROM transactions 
           WHERE recurring_series_id = $1 
           AND is_recurring_template = false 
           AND date >= $2`,
          [seriesId, startFrom]
        );
      }

      // 3. Find the latest existing transaction to determine where to start
      const latestResult = await client.query(
        `SELECT MAX(date) as latest_date 
         FROM transactions 
         WHERE recurring_series_id = $1 
         AND is_recurring_template = false`,
        [seriesId]
      );

      const latestDate = latestResult.rows[0].latest_date
        ? new Date(latestResult.rows[0].latest_date)
        : new Date(series.start_date);

      // 4. Calculate occurrences
      const generationStartDate = regenerateAll ? startFrom : latestDate;
      const occurrences = calculateOccurrences(
        series,
        generationStartDate,
        12 // Generate up to 12 occurrences at a time
      );

      // 5. Generate transactions for each occurrence
      const generatedTransactions = [];

      for (const occurrenceDate of occurrences) {
        // Check if a transaction already exists for this date
        const existingResult = await client.query(
          `SELECT id FROM transactions 
           WHERE recurring_series_id = $1 
           AND is_recurring_template = false 
           AND date = $2`,
          [seriesId, occurrenceDate]
        );

        if (existingResult.rows.length === 0) {
          // Create a new transaction based on the template
          const insertResult = await client.query(
            `INSERT INTO transactions (
              transaction_type, from_account_id, to_account_id, 
              amount, date, status, description, 
              recurring_series_id, is_recurring_template, generation_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`,
            [
              template.transaction_type,
              template.from_account_id,
              template.to_account_id,
              template.amount,
              occurrenceDate,
              occurrenceDate <= new Date() ? "Posted" : "Scheduled", // Auto-post past transactions
              template.description,
              seriesId,
              false, // Not a template
              new Date(), // When it was generated
            ]
          );

          generatedTransactions.push(insertResult.rows[0]);
        }
      }

      await client.query("COMMIT");
      return generatedTransactions;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to generate recurring transactions", 500);
  }
};

/**
 * Create a new recurring transaction series with template
 * @param {Object} seriesData - The recurring series data
 * @param {Object} templateData - The template transaction data
 * @returns {Promise<Object>} - The created series with template and generated instances
 */
const createRecurringSeries = async (seriesData, templateData) => {
  try {
    // Start a transaction
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Create the recurring series
      const seriesResult = await client.query(
        `INSERT INTO recurring_transaction_series (
          name, description, recurrence_type, recurrence_interval,
          start_date, end_date, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *`,
        [
          seriesData.name,
          seriesData.description,
          seriesData.recurrence_type,
          seriesData.recurrence_interval,
          seriesData.start_date,
          seriesData.end_date,
        ]
      );

      const series = seriesResult.rows[0];

      // 2. Create the template transaction
      const templateResult = await client.query(
        `INSERT INTO transactions (
          transaction_type, from_account_id, to_account_id,
          amount, date, status, description,
          recurring_series_id, is_recurring_template, generation_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          templateData.transaction_type,
          templateData.from_account_id,
          templateData.to_account_id,
          templateData.amount,
          templateData.date || seriesData.start_date,
          "Created", // Changed from "Template" to "Created" to match check constraint
          templateData.description,
          series.id,
          true,
          new Date(),
        ]
      );

      const template = templateResult.rows[0];

      // 3. Generate initial transactions
      // Determine how many occurrences to generate based on recurrence type and end date
      const startDate = new Date(seriesData.start_date);
      let occurrencesToGenerate = 12; // Default to 12 occurrences

      // If there's no end date, generate transactions for a reasonable time period
      // based on the recurrence type
      if (!seriesData.end_date) {
        switch (seriesData.recurrence_type) {
          case "daily":
            occurrencesToGenerate = 30; // About a month of daily transactions
            break;
          case "weekly":
            occurrencesToGenerate = 52; // About a year of weekly transactions
            break;
          case "monthly":
            occurrencesToGenerate = 24; // Two years of monthly transactions
            break;
          case "yearly":
            occurrencesToGenerate = 5; // Five years of yearly transactions
            break;
        }
      } else {
        // If there is an end date, calculate how many occurrences would fit between
        // start and end date (up to a reasonable maximum)
        const endDate = new Date(seriesData.end_date);
        const daysInterval = Math.floor(
          (endDate - startDate) / (1000 * 60 * 60 * 24)
        );

        if (seriesData.recurrence_type === "daily") {
          occurrencesToGenerate = Math.min(daysInterval, 30);
        } else if (seriesData.recurrence_type === "weekly") {
          occurrencesToGenerate = Math.min(Math.floor(daysInterval / 7), 52);
        } else if (seriesData.recurrence_type === "monthly") {
          occurrencesToGenerate = Math.min(Math.floor(daysInterval / 30), 24);
        } else if (seriesData.recurrence_type === "yearly") {
          occurrencesToGenerate = Math.min(Math.floor(daysInterval / 365), 5);
        }
      }

      // Find the furthest plan end date to consider for transaction generation
      const planResult = await client.query(
        `SELECT MAX(end_date) as max_end_date FROM plans`
      );

      const maxPlanEndDate = planResult.rows[0].max_end_date
        ? new Date(planResult.rows[0].max_end_date)
        : null;

      // If we have plans, and the furthest plan end date is beyond our calculated end date,
      // adjust our occurrences calculation to include transactions up to the plan end date
      if (maxPlanEndDate) {
        const occurrences = calculateOccurrences(
          seriesData,
          startDate,
          occurrencesToGenerate
        );
        const lastOccurrenceDate =
          occurrences.length > 0 ? occurrences[occurrences.length - 1] : null;

        // If the last occurrence is before the max plan end date, generate more occurrences
        if (lastOccurrenceDate && lastOccurrenceDate < maxPlanEndDate) {
          // Recalculate with more occurrences to try to reach the plan end date
          // but still cap it at a reasonable number
          const additionalOccurrences = Math.min(
            100,
            occurrencesToGenerate * 2
          );
          occurrencesToGenerate = additionalOccurrences;
        }
      }

      const occurrences = calculateOccurrences(
        seriesData,
        startDate,
        occurrencesToGenerate
      );

      // Create transactions for each occurrence
      const generatedTransactions = [];

      for (const occurrenceDate of occurrences) {
        // Create a new transaction based on the template
        const insertResult = await client.query(
          `INSERT INTO transactions (
            transaction_type, from_account_id, to_account_id, 
            amount, date, status, description, 
            recurring_series_id, is_recurring_template, generation_date
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *`,
          [
            templateData.transaction_type,
            templateData.from_account_id,
            templateData.to_account_id,
            templateData.amount,
            occurrenceDate,
            occurrenceDate <= new Date() ? "Posted" : "Scheduled", // Auto-post past transactions
            templateData.description,
            series.id,
            false, // Not a template
            new Date(), // When it was generated
          ]
        );

        generatedTransactions.push(insertResult.rows[0]);
      }

      await client.query("COMMIT");

      return {
        series,
        template,
        instances: generatedTransactions,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("ERROR CREATING RECURRING TRANSACTION SERIES:", error);
    throw new ApiError(
      `Failed to create recurring transaction series: ${error.message}`,
      500
    );
  }
};

/**
 * Update a recurring transaction series and optionally its instances
 * @param {number} seriesId - The ID of the series to update
 * @param {Object} seriesData - The updated series data
 * @param {Object} templateData - The updated template data
 * @param {string} updateScope - Whether to update 'none', 'future', or 'all' instances
 * @returns {Promise<Object>} - The updated series and affected instances
 */
const updateRecurringSeries = async (
  seriesId,
  seriesData,
  templateData,
  updateScope = "none"
) => {
  try {
    // Start a transaction
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Update the recurring series
      const seriesResult = await client.query(
        `UPDATE recurring_transaction_series SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          recurrence_type = COALESCE($3, recurrence_type),
          recurrence_interval = COALESCE($4, recurrence_interval),
          start_date = COALESCE($5, start_date),
          end_date = $6,
          updated_at = NOW()
        WHERE id = $7
        RETURNING *`,
        [
          seriesData.name,
          seriesData.description,
          seriesData.recurrence_type,
          seriesData.recurrence_interval,
          seriesData.start_date,
          seriesData.end_date, // Can be NULL
          seriesId,
        ]
      );

      if (seriesResult.rows.length === 0) {
        throw new ApiError(
          `No recurring series found with id ${seriesId}`,
          404
        );
      }

      const series = seriesResult.rows[0];

      // 2. Update the template transaction if template data is provided
      let template = null;

      if (templateData) {
        const templateResult = await client.query(
          `UPDATE transactions SET
            transaction_type = COALESCE($1, transaction_type),
            from_account_id = $2,
            to_account_id = $3,
            amount = COALESCE($4, amount),
            description = COALESCE($5, description),
            updated_at = NOW()
          WHERE recurring_series_id = $6 AND is_recurring_template = true
          RETURNING *`,
          [
            templateData.transaction_type,
            templateData.from_account_id,
            templateData.to_account_id,
            templateData.amount,
            templateData.description,
            seriesId,
          ]
        );

        if (templateResult.rows.length === 0) {
          throw new ApiError(
            `No template transaction found for series ${seriesId}`,
            404
          );
        }

        template = templateResult.rows[0];

        // 3. Update future instances if requested
        if (updateScope === "future" || updateScope === "all") {
          const today = new Date();

          // Define what fields to update based on provided template data
          const updateFields = [];
          const updateValues = [];
          let paramIndex = 1;

          if (templateData.transaction_type) {
            updateFields.push(`transaction_type = $${paramIndex}`);
            updateValues.push(templateData.transaction_type);
            paramIndex++;
          }

          // Handle nullable fields
          updateFields.push(`from_account_id = $${paramIndex}`);
          updateValues.push(templateData.from_account_id);
          paramIndex++;

          updateFields.push(`to_account_id = $${paramIndex}`);
          updateValues.push(templateData.to_account_id);
          paramIndex++;

          if (templateData.amount) {
            updateFields.push(`amount = $${paramIndex}`);
            updateValues.push(templateData.amount);
            paramIndex++;
          }

          if (templateData.description !== undefined) {
            updateFields.push(`description = $${paramIndex}`);
            updateValues.push(templateData.description);
            paramIndex++;
          }

          // Add the WHERE conditions
          updateValues.push(seriesId);
          paramIndex++;

          const dateCondition =
            updateScope === "all" ? "" : `AND date >= $${paramIndex}`;
          if (updateScope === "future") {
            updateValues.push(today);
            paramIndex++;
          }

          if (updateFields.length > 0) {
            await client.query(
              `UPDATE transactions SET
                ${updateFields.join(", ")},
                updated_at = NOW()
              WHERE recurring_series_id = $${paramIndex - 1}
                AND is_recurring_template = false
                ${dateCondition}`,
              updateValues
            );
          }
        }

        // 4. If recurrence parameters changed, regenerate future transactions
        if (
          seriesData.recurrence_type ||
          seriesData.recurrence_interval ||
          seriesData.start_date ||
          seriesData.end_date !== undefined
        ) {
          // Delete future transactions
          await client.query(
            `DELETE FROM transactions 
             WHERE recurring_series_id = $1 
             AND is_recurring_template = false 
             AND date >= $2`,
            [seriesId, new Date()]
          );

          // Regenerate them
          await generateRecurringTransactions(seriesId, new Date(), true);
        }
      }

      await client.query("COMMIT");

      return {
        series,
        template,
        updateScope,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to update recurring transaction series", 500);
  }
};

/**
 * Delete a recurring transaction series and optionally its instances
 * @param {number} seriesId - The ID of the series to delete
 * @param {boolean} keepInstances - Whether to keep the instances
 * @returns {Promise<Object>} - Success message
 */
const deleteRecurringSeries = async (seriesId, keepInstances = false) => {
  try {
    // Start a transaction
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Check if series exists
      const seriesResult = await client.query(
        `SELECT * FROM recurring_transaction_series WHERE id = $1`,
        [seriesId]
      );

      if (seriesResult.rows.length === 0) {
        throw new ApiError(
          `No recurring series found with id ${seriesId}`,
          404
        );
      }

      // If not keeping instances, delete all related transactions
      if (!keepInstances) {
        await client.query(
          `DELETE FROM transactions 
           WHERE recurring_series_id = $1`,
          [seriesId]
        );
      } else {
        // If keeping instances, just delete the template
        await client.query(
          `DELETE FROM transactions 
           WHERE recurring_series_id = $1 
           AND is_recurring_template = true`,
          [seriesId]
        );

        // And unlink the instances
        await client.query(
          `UPDATE transactions 
           SET recurring_series_id = NULL, updated_at = NOW()
           WHERE recurring_series_id = $1`,
          [seriesId]
        );
      }

      // Delete the series
      await client.query(
        `DELETE FROM recurring_transaction_series WHERE id = $1`,
        [seriesId]
      );

      await client.query("COMMIT");

      return {
        success: true,
        message: `Recurring series ${seriesId} deleted successfully${
          keepInstances ? ", instances kept" : ""
        }`,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to delete recurring transaction series", 500);
  }
};

module.exports = {
  calculateOccurrences,
  generateRecurringTransactions,
  createRecurringSeries,
  updateRecurringSeries,
  deleteRecurringSeries,
};
