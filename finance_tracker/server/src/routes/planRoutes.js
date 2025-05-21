// planRoutes.js
const express = require("express");
const planController = require("../controllers/planController");

const router = express.Router();

// Create a new plan
router.post("/", planController.createPlan);

// Get all plans
router.get("/", planController.getAllPlans);

// Get a specific plan with linked accounts
router.get("/:id", planController.getPlanById);

// Link an account to a plan
router.post("/:planId/accounts", planController.linkAccountToPlan);

// Unlink an account from a plan
router.delete("/:planId/accounts", planController.unlinkAccountFromPlan);

module.exports = router;
