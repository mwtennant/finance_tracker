-- Allow term_months to be NULL in loans table
ALTER TABLE loans ALTER COLUMN term_months DROP NOT NULL;
