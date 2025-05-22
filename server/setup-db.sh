#!/bin/bash
# Setup database tables for the Finance Tracker app

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL client (psql) is not installed. Please install it first."
    exit 1
fi

# Create the database if it doesn't exist
echo "Creating database if it doesn't exist..."
psql -h $DB_HOST -U $DB_USER -p $DB_PORT -c "CREATE DATABASE $DB_NAME WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8' TEMPLATE=template0;" postgres || true

# Run the schema file
echo "Setting up database schema..."
psql -h $DB_HOST -U $DB_USER -p $DB_PORT -d $DB_NAME -f src/db/schema.sql

# Apply all migration scripts
echo "Applying database migrations..."
for migration in src/db/migrations/*.sql; do
    echo "Applying migration: $migration"
    psql -h $DB_HOST -U $DB_USER -p $DB_PORT -d $DB_NAME -f $migration
done

echo "Database setup complete!"
