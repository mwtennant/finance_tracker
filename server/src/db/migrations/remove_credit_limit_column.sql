-- Migration script to remove 'credit_limit' column from credit_accounts table
DO $$
BEGIN
    -- Check if the column exists
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'credit_accounts' AND column_name = 'credit_limit'
    ) THEN
        -- Drop the column if it exists
        ALTER TABLE credit_accounts DROP COLUMN credit_limit;
        RAISE NOTICE 'Removed credit_limit column from credit_accounts table';
    ELSE
        RAISE NOTICE 'credit_limit column does not exist in credit_accounts table';
    END IF;
END $$;
