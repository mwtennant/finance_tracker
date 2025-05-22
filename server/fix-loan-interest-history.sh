#!/bin/bash
# Apply the migration to create loan_interest_history table

# Load environment variables
export $(grep -v '^#' .env | xargs)

echo "Applying migration to create loan_interest_history table..."
psql -h $DB_HOST -U $DB_USER -p $DB_PORT -d $DB_NAME -f src/db/migrations/create_loan_interest_history.sql

echo "Migration complete!"
