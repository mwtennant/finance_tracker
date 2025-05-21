-- plans table
CREATE TABLE plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Created accounts table
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  apr DECIMAL(5, 2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Account APR history table
CREATE TABLE account_apr_history (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
  apr DECIMAL(5, 2) NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Credit accounts table
CREATE TABLE credit_accounts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  credit_limit DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Credit account interest rate history table
CREATE TABLE credit_account_interest_history (
  id SERIAL PRIMARY KEY,
  credit_account_id INTEGER REFERENCES credit_accounts(id) ON DELETE CASCADE,
  interest_rate DECIMAL(5, 2) NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Loans table
CREATE TABLE loans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  interest_rate DECIMAL(5, 2) NOT NULL,
  term_months INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Loan interest rate history table
CREATE TABLE loan_interest_history (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER REFERENCES loans(id) ON DELETE CASCADE,
  interest_rate DECIMAL(5, 2) NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Investment accounts table
CREATE TABLE investment_accounts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  type VARCHAR(50) NOT NULL,
  targeted_rate DECIMAL(5, 2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Investment balance history for manual confirmations
CREATE TABLE investment_balance_history (
  id SERIAL PRIMARY KEY,
  investment_account_id INTEGER REFERENCES investment_accounts(id) ON DELETE CASCADE,
  balance DECIMAL(15, 2) NOT NULL,
  confirmation_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Linking tables for each account type with plans
CREATE TABLE plan_accounts (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
  account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(plan_id, account_id)
);

-- Transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  transaction_type VARCHAR(50) NOT NULL,
  from_account_id INTEGER,
  to_account_id INTEGER,
  amount DECIMAL(15, 2) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Created',
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT check_transaction_type CHECK (
    transaction_type IN ('deposit', 'withdraw', 'transfer', 'loan_payment', 'interest_paid', 'interest_earned', 'credit_card_spending', 'credit_card_payment')
  ),
  CONSTRAINT check_status CHECK (
    status IN ('Created', 'Scheduled', 'Posted', 'Pending', 'Canceled')
  )
);

CREATE TABLE plan_credit_accounts (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
  credit_account_id INTEGER REFERENCES credit_accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(plan_id, credit_account_id)
);

CREATE TABLE plan_loans (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
  loan_id INTEGER REFERENCES loans(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(plan_id, loan_id)
);

CREATE TABLE plan_investment_accounts (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
  investment_account_id INTEGER REFERENCES investment_accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(plan_id, investment_account_id)
);

-- Indexes for better query performance
CREATE INDEX idx_plans_id ON plans(id);
CREATE INDEX idx_plan_accounts_plan_id ON plan_accounts(plan_id);
CREATE INDEX idx_plan_credit_accounts_plan_id ON plan_credit_accounts(plan_id);
CREATE INDEX idx_plan_loans_plan_id ON plan_loans(plan_id);
CREATE INDEX idx_plan_investment_accounts_plan_id ON plan_investment_accounts(plan_id);
