const express = require("express");
const router = express.Router();
const recurringTransactionController = require("../controllers/recurringTransactionController");

// GET all recurring transaction series
router.get("/", recurringTransactionController.getAllRecurringSeries);

// GET a specific recurring transaction series by id
router.get("/:id", recurringTransactionController.getRecurringSeriesById);

// POST create a new recurring transaction series
router.post("/", recurringTransactionController.createRecurringSeries);

// PUT update a recurring transaction series
router.put("/:id", recurringTransactionController.updateRecurringSeries);

// DELETE a recurring transaction series
router.delete("/:id", recurringTransactionController.deleteRecurringSeries);

// POST generate or regenerate recurring transactions for a series
router.post(
  "/:id/generate",
  recurringTransactionController.generateRecurringTransactions
);

module.exports = router;
