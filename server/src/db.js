const { Pool } = require("pg");
require("dotenv").config();

// Log environment variables for debugging
console.log("Database Environment Variables:");
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Import mock database for testing
const { testPool } = require("./config/testDb");

// Use DATABASE_URL from .env if available, otherwise use individual config vars
const realPool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      user: "postgres", // Hardcoded for testing
      host: "localhost",
      database: "finance_tracker",
      password: "postgres", // Hardcoded for testing
      port: 5432,
    });

// Use the test pool when in test mode, otherwise use the real pool
const pool = process.env.NODE_ENV === "test" ? testPool : realPool;

const connectDB = async () => {
  try {
    // For testing purposes, we'll just log success without actually connecting
    if (process.env.NODE_ENV === "test") {
      console.log("Test database connection successful");
      return true;
    }

    await pool.connect();
    console.log("Connected to PostgreSQL database");
  } catch (err) {
    console.error("Database connection error", err.stack);
    // Don't throw an error if in test mode
    if (process.env.NODE_ENV === "test") {
      console.log("Using test database for testing");
      return true;
    }
    throw err;
  }
};

module.exports = {
  pool,
  connectDB,
};
