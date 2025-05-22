#!/bin/bash
# Run the new migration to fix the account_apr_history table issue

# Load environment variables
export $(grep -v '^#' .env | xargs) 2>/dev/null

echo "Applying account_apr_history table migration..."
psql -h $DB_HOST -U $DB_USER -p $DB_PORT -d $DB_NAME -f src/db/migrations/create_apr_history_table.sql

echo "Migration complete!"
