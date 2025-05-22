-- Migration script to add 'apr' column to accounts table if it doesn't exist
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'apr'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE accounts ADD COLUMN apr DECIMAL(5, 2);
        RAISE NOTICE 'Added apr column to accounts table';
    ELSE
        RAISE NOTICE 'apr column already exists in accounts table';
    END IF;
END $$;
