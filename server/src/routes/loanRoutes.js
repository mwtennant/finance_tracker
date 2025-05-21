// loanRoutes.js
const express = require("express");
const loanController = require("../controllers/loanController");

const router = express.Router();

// Create a new loan
router.post("/", loanController.createLoan);

// Get all loans
router.get("/", loanController.getAllLoans);

// Get a specific loan
router.get("/:id", loanController.getLoanById);

// Update a loan
router.put("/:id", loanController.updateLoan);

// Delete a loan
router.delete("/:id", loanController.deleteLoan);

// Get interest rate history for a loan
router.get("/:id/interest-history", loanController.getLoanInterestHistory);

module.exports = router;
