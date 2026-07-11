-- The auto-generated diff for this migration mishandled the generated
-- searchVector columns (Postgres rejects "ALTER COLUMN ... DROP DEFAULT" on a
-- GENERATED column) and, in the process of failing, still dropped both GIN
-- indexes non-transactionally. This is the corrected, hand-written version:
-- the actual intended change, plus recreating the two indexes.

ALTER TABLE "User" ALTER COLUMN "name" DROP NOT NULL;

-- IF NOT EXISTS: a fresh install (shadow DB, new environment) already has
-- these from the previous migration and never lost them; only this specific
-- dev database had them dropped by the earlier botched migration attempt.
CREATE INDEX IF NOT EXISTS "Artifact_searchVector_idx" ON "Artifact" USING GIN ("searchVector");
CREATE INDEX IF NOT EXISTS "User_searchVector_idx" ON "User" USING GIN ("searchVector");
