// investmentAccountRoutes.js
const express = require("express");
const investmentAccountController = require("../controllers/investmentAccountController");

const router = express.Router();

// Create a new investment account
router.post("/", investmentAccountController.createInvestmentAccount);

// Get all investment accounts
router.get("/", investmentAccountController.getAllInvestmentAccounts);

// Get a specific investment account
router.get("/:id", investmentAccountController.getInvestmentAccountById);

// Update an investment account
router.put("/:id", investmentAccountController.updateInvestmentAccount);

// Delete an investment account
router.delete("/:id", investmentAccountController.deleteInvestmentAccount);

// Manually confirm investment account balance
router.post(
  "/:id/confirm-balance",
  investmentAccountController.confirmInvestmentBalance
);

// Get balance history for an investment account
router.get(
  "/:id/balance-history",
  investmentAccountController.getInvestmentBalanceHistory
);

module.exports = router;
