-- Add the targeted_rate column to the investment_accounts table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'investment_accounts' AND column_name = 'targeted_rate'
    ) THEN
        ALTER TABLE investment_accounts ADD COLUMN targeted_rate DECIMAL(5, 2);
    END IF;
END $$;
