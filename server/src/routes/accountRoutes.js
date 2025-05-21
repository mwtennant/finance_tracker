// accountRoutes.js
const express = require("express");
const accountController = require("../controllers/accountController");

const router = express.Router();

// Create a new account
router.post("/", accountController.createAccount);

// Get all accounts
router.get("/", accountController.getAllAccounts);

// Get a specific account
router.get("/:id", accountController.getAccountById);

// Update an account
router.put("/:id", accountController.updateAccount);

// Delete an account
router.delete("/:id", accountController.deleteAccount);

// Get APR history for an account
router.get("/:id/apr-history", accountController.getAccountAPRHistory);

module.exports = router;
