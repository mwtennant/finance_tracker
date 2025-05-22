-- Create loan_interest_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS loan_interest_history (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER REFERENCES loans(id) ON DELETE CASCADE,
  interest_rate DECIMAL(5, 2) NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
