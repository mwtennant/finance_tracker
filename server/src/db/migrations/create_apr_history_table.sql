-- Migration script to create 'account_apr_history' table if it doesn't exist
DO $$
BEGIN
    -- Check if the table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'account_apr_history'
    ) THEN
        -- Create the table if it doesn't exist
        CREATE TABLE account_apr_history (
            id SERIAL PRIMARY KEY,
            account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
            apr DECIMAL(5, 2) NOT NULL,
            effective_date DATE NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        
        CREATE INDEX idx_account_apr_history_account_id ON account_apr_history(account_id);
        
        RAISE NOTICE 'Created account_apr_history table';
    ELSE
        RAISE NOTICE 'account_apr_history table already exists';
    END IF;
END $$;
