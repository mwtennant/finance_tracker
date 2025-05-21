const { Pool } = require("pg");
require("dotenv").config();

// Import mock database for testing
const { testPool } = require("./config/testDb");

// Use DATABASE_URL from .env if available, otherwise use individual config vars
const realPool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      user: process.env.DB_USER || "user",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "mydatabase",
      password: process.env.DB_PASSWORD || "password",
      port: process.env.DB_PORT || 5432,
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
