-- Migration: Add recurring transaction support
-- Date: 2025-05-21

-- New table for recurring transaction series
CREATE TABLE recurring_transaction_series (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  recurrence_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly, yearly
  recurrence_interval INTEGER NOT NULL DEFAULT 1, -- every X days/weeks/months/years
  start_date DATE NOT NULL,
  end_date DATE, -- NULL means indefinite
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT check_recurrence_type CHECK (
    recurrence_type IN ('daily', 'weekly', 'monthly', 'yearly')
  )
);

-- Add recurring series references to transactions table
ALTER TABLE transactions 
ADD COLUMN recurring_series_id INTEGER REFERENCES recurring_transaction_series(id) ON DELETE SET NULL,
ADD COLUMN is_recurring_template BOOLEAN DEFAULT FALSE,
ADD COLUMN generation_date TIMESTAMP;

-- Add index for better performance when querying by series
CREATE INDEX idx_transactions_recurring_series_id ON transactions(recurring_series_id);
