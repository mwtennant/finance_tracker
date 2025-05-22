#!/bin/bash
# Script to run the migration to remove credit_limit column

echo "Running migration to remove credit_limit column from credit_accounts table..."
psql -U postgres -d finance_tracker -f src/db/migrations/remove_credit_limit_column.sql
echo "Migration completed."
