-- Postgres won't accept to_tsvector('simple', ...), array_to_string(...), or an
-- enum::text cast directly in a GENERATED column expression: none of them are
-- declared IMMUTABLE (the tsvector config lookup and array_to_string are only
-- STABLE). Wrapping the first two in functions we declare IMMUTABLE is the
-- standard workaround — safe here since 'simple' text search config and
-- array-to-string formatting for text[] never change behavior. The enum is
-- turned into text via CASE instead of a cast, which sidesteps the issue.
CREATE FUNCTION "proof_simple_tsvector"(text) RETURNS tsvector AS $$
  SELECT to_tsvector('simple', $1);
$$ LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE;

CREATE FUNCTION "proof_array_to_string"(text[]) RETURNS text AS $$
  SELECT array_to_string($1, ' ');
$$ LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE;

-- AlterTable
ALTER TABLE "Artifact" ADD COLUMN "searchVector" tsvector
GENERATED ALWAYS AS (
  setweight(proof_simple_tsvector(coalesce(title, '')), 'A') ||
  setweight(proof_simple_tsvector(coalesce(description, '')), 'B') ||
  setweight(proof_simple_tsvector(proof_array_to_string(stack)), 'B') ||
  setweight(proof_simple_tsvector(coalesce(
    CASE type
      WHEN 'REPO' THEN 'repo'
      WHEN 'PRODUCT' THEN 'produit live'
      WHEN 'CASE_STUDY' THEN 'etude de cas'
      WHEN 'CONTRIBUTION' THEN 'contribution'
    END, '')), 'C')
) STORED;

CREATE INDEX "Artifact_searchVector_idx" ON "Artifact" USING GIN ("searchVector");

-- AlterTable
ALTER TABLE "User" ADD COLUMN "searchVector" tsvector
GENERATED ALWAYS AS (
  setweight(proof_simple_tsvector(coalesce(name, '')), 'A') ||
  setweight(proof_simple_tsvector(coalesce(handle, '')), 'A') ||
  setweight(proof_simple_tsvector(coalesce(bio, '')), 'B')
) STORED;

CREATE INDEX "User_searchVector_idx" ON "User" USING GIN ("searchVector");
