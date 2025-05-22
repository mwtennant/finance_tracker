#!/bin/bash
# Apply the recurring transactions database migration

echo "Applying recurring transactions migration..."
docker-compose exec postgres psql -U postgres -d finance_tracker -f /app/server/src/db/migrations/20250521_add_recurring_transactions.sql

if [ $? -eq 0 ]; then
  echo "Migration completed successfully!"
else
  echo "Migration failed. Please check the error message above."
  exit 1
fi

echo "Recurring transactions feature is now ready to use!"
