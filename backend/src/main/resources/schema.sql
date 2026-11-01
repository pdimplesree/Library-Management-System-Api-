-- Hibernate previously created users.role as an H2 ENUM containing only
-- ADMIN and STUDENT. Convert it before Hibernate updates the schema so that
-- the LIBRARIAN role can be stored. IF EXISTS keeps fresh databases unchanged.
ALTER TABLE IF EXISTS users ALTER COLUMN IF EXISTS role VARCHAR(20) NOT NULL;
