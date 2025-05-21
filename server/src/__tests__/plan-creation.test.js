// server/src/__tests__/plan-creation.test.js
const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { ApiError } = require("../middleware/errorMiddleware");
const planRoutes = require("../routes/planRoutes");

// Mock the database pool
jest.mock("../db", () => ({
  pool: {
    query: jest.fn(),
  },
  connectDB: jest.fn(),
}));

// Get the mocked pool
const { pool } = require("../db");

// Create an Express app for testing
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api/plans", planRoutes);

// Add error handling middleware for testing
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

describe("Plan Creation Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a plan with valid data", async () => {
    // Prepare test data
    const planData = {
      name: "Test Plan",
      description: "Test description",
      start_date: "2025-01-01",
      end_date: "2026-01-01",
    };

    // Mock the database response
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          ...planData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    });

    // Make the API request
    const response = await request(app).post("/").send(planData);

    // Assertions
    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.data.name).toBe(planData.name);
  });

  test("should return error with missing required fields", async () => {
    // Prepare incomplete data
    const planData = {
      name: "Missing Fields Plan",
      // Missing start_date and end_date
    };

    // Make the API request
    const response = await request(app).post("/").send(planData);

    // Assertions
    expect(response.status).toBe(400);
    expect(response.body.status).toBe("error");
  });
});
