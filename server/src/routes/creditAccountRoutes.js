// creditAccountRoutes.js
const express = require("express");
const creditAccountController = require("../controllers/creditAccountController");

const router = express.Router();

// Create a new credit account
router.post("/", creditAccountController.createCreditAccount);

// Get all credit accounts
router.get("/", creditAccountController.getAllCreditAccounts);

// Get a specific credit account
router.get("/:id", creditAccountController.getCreditAccountById);

// Update a credit account
router.put("/:id", creditAccountController.updateCreditAccount);

// Delete a credit account
router.delete("/:id", creditAccountController.deleteCreditAccount);

module.exports = router;
