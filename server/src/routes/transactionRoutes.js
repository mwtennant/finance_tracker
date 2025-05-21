// transactionRoutes.js
const express = require("express");
const transactionController = require("../controllers/transactionController");

const router = express.Router();

// Create a new transaction
router.post("/", transactionController.createTransaction);

// Get all transactions (with optional filtering)
router.get("/", transactionController.getAllTransactions);

// Get a specific transaction
router.get("/:id", transactionController.getTransactionById);

// Update a transaction's status
router.patch("/:id/status", transactionController.updateTransactionStatus);

// Delete a transaction
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
