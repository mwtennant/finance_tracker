const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");
const routes = require("./routes");
const {
  notFoundHandler,
  errorHandler,
} = require("./middleware/errorMiddleware");
const loggingMiddleware = require("./middleware/loggingMiddleware");

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
// Configure CORS with specific options
const corsOptions = {
  origin: ["http://localhost:3001", "http://localhost:3000"], // Allow your client origins
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(loggingMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
db.connectDB();

// Basic health check endpoint for debugging
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Routes
app.use("/api", routes);

// Error handling middleware
app.use(notFoundHandler); // Handle 404 errors for undefined routes
app.use(errorHandler); // Global error handler

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
