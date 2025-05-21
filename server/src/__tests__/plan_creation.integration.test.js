const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const planRoutes = require("../routes/planRoutes");
const { ApiError } = require("../middleware/errorMiddleware");

// Mock the database pool
jest.mock("../db", () => ({
  pool: {
    query: jest.fn(),
  },
  connectDB: jest.fn(),
}));

// Set test environment
process.env.NODE_ENV = "test";

// Create an Express app for testing that mimics the real app
const app = express();
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

// Get the mocked pool
const { pool } = require("../db");

describe("Plan Creation Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/plans", () => {
    it("should create a valid plan successfully", async () => {
      // Create test plan data
      const planData = {
        name: "Integration Test Plan",
        description: "Test plan created during integration testing",
        start_date: "2025-06-01",
        end_date: "2035-06-01",
      };

      // Mock the database query response (not needed in test mode but kept for reference)
      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 99,
            ...planData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });

      // Make the API request
      const response = await request(app).post("/api/plans").send(planData);

      // Assertions
      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.name).toBe(planData.name);
      expect(response.body.data.id).toBe(99);

      // Verify the correct SQL was executed
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO plans"),
        expect.arrayContaining([
          planData.name,
          planData.description,
          planData.start_date,
          planData.end_date,
        ])
      );
    });

    it("should handle missing required fields", async () => {
      // Create invalid plan data (missing required fields)
      const planData = {
        name: "Missing Fields Plan",
        // Missing start_date and end_date
      };

      // Make the API request
      const response = await request(app).post("/api/plans").send(planData);

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("required");

      // Verify no database query was executed
      expect(pool.query).not.toHaveBeenCalled();
    });

    it("should handle invalid date ranges", async () => {
      // Create plan data with invalid date range
      const planData = {
        name: "Invalid Date Range Plan",
        description: "Plan with end date before start date",
        start_date: "2030-01-01",
        end_date: "2025-01-01", // End date before start date
      };

      // Make the API request
      const response = await request(app).post("/api/plans").send(planData);

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain(
        "End date must be after start date"
      );

      // Verify no database query was executed
      expect(pool.query).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      // Create valid plan data
      const planData = {
        name: "Database Error Plan",
        description: "Plan that will trigger a database error",
        start_date: "2025-07-01",
        end_date: "2035-07-01",
      };

      // Mock a database error
      pool.query.mockRejectedValueOnce(new Error("Database connection failed"));

      // Make the API request
      const response = await request(app).post("/api/plans").send(planData);

      // Assertions
      expect(response.status).toBe(500);
      expect(response.body.status).toBe("error");

      // Verify the query was attempted
      expect(pool.query).toHaveBeenCalled();
    });

    it("should create a plan with only required fields", async () => {
      // Create minimal plan data with only required fields
      const planData = {
        name: "Minimal Plan",
        start_date: "2026-01-01",
        end_date: "2036-01-01",
        // No description
      };

      // Mock the database query response
      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 100,
            ...planData,
            description: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });

      // Make the API request
      const response = await request(app).post("/api/plans").send(planData);

      // Assertions
      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.name).toBe(planData.name);
      expect(response.body.data.description).toBeNull();

      // Verify the correct SQL was executed with null values for optional fields
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO plans"),
        expect.arrayContaining([
          planData.name,
          null, // description
          planData.start_date,
          planData.end_date,
        ])
      );
    });
  });
});
