#!/bin/bash
# Apply the migration to allow NULL values in term_months column

# Load environment variables
export $(grep -v '^#' .env | xargs)

echo "Applying migration to allow NULL values in term_months column..."
psql -h $DB_HOST -U $DB_USER -p $DB_PORT -d $DB_NAME -f src/db/migrations/allow_null_term_months.sql

echo "Migration complete!"
