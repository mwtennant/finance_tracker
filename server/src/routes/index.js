// This file sets up the API routes for the application.
const express = require("express");
const router = express.Router();
const exampleController = require("../controllers/exampleController");
const planRoutes = require("./planRoutes");
const accountRoutes = require("./accountRoutes");
const creditAccountRoutes = require("./creditAccountRoutes");
const loanRoutes = require("./loanRoutes");
const investmentAccountRoutes = require("./investmentAccountRoutes");
const transactionRoutes = require("./transactionRoutes");

// Plan routes
router.use("/plans", planRoutes);

// Account routes
router.use("/accounts", accountRoutes);
router.use("/credit-accounts", creditAccountRoutes);
router.use("/loans", loanRoutes);
router.use("/investment-accounts", investmentAccountRoutes);

// Transaction routes
router.use("/transactions", transactionRoutes);

// Example routes
router.get("/example", exampleController.getExample);
router.post("/example", exampleController.createExample);

module.exports = router;
