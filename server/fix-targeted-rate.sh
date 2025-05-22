#!/bin/bash

# Apply the fix to add the targeted_rate column to the investment_accounts table
echo "Adding targeted_rate column to investment_accounts table if it doesn't exist..."
psql -U postgres -d finance_tracker -f ./src/db/migrations/add_targeted_rate_column.sql

echo "Migration completed successfully!"
