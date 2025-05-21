// src/config/testDb.js
// Test database configuration for backend testing

const { Pool } = require("pg");

// Use a test database for testing
const testPool = new Pool({
  connectionString:
    process.env.TEST_DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/finance_tracker_test",
});

// Helper function to reset the test database before tests
const resetTestDatabase = async () => {
  try {
    // Drop existing tables in reverse order (due to foreign key constraints)
    await testPool.query(
      "DROP TABLE IF EXISTS plan_investment_accounts CASCADE"
    );
    await testPool.query("DROP TABLE IF EXISTS plan_loans CASCADE");
    await testPool.query("DROP TABLE IF EXISTS plan_credit_accounts CASCADE");
    await testPool.query("DROP TABLE IF EXISTS plan_created_accounts CASCADE");
    await testPool.query("DROP TABLE IF EXISTS investment_accounts CASCADE");
    await testPool.query("DROP TABLE IF EXISTS loans CASCADE");
    await testPool.query("DROP TABLE IF EXISTS credit_accounts CASCADE");
    await testPool.query("DROP TABLE IF EXISTS created_accounts CASCADE");
    await testPool.query("DROP TABLE IF EXISTS plans CASCADE");

    // Recreate tables (simplified schema for testing)
    await testPool.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS created_accounts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS credit_accounts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
        limit DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS loans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
        term_months INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS investment_accounts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create linking tables
    await testPool.query(`
      CREATE TABLE IF NOT EXISTS plan_created_accounts (
        plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
        account_id INTEGER REFERENCES created_accounts(id) ON DELETE CASCADE,
        PRIMARY KEY (plan_id, account_id)
      )
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS plan_credit_accounts (
        plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
        credit_account_id INTEGER REFERENCES credit_accounts(id) ON DELETE CASCADE,
        PRIMARY KEY (plan_id, credit_account_id)
      )
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS plan_loans (
        plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
        loan_id INTEGER REFERENCES loans(id) ON DELETE CASCADE,
        PRIMARY KEY (plan_id, loan_id)
      )
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS plan_investment_accounts (
        plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
        investment_account_id INTEGER REFERENCES investment_accounts(id) ON DELETE CASCADE,
        PRIMARY KEY (plan_id, investment_account_id)
      )
    `);

    console.log("Test database reset successfully");
  } catch (error) {
    console.error("Error resetting test database:", error);
    throw error;
  }
};

module.exports = {
  testPool,
  resetTestDatabase,
};
