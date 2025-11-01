-- AI Risk Manager Database Initialization Script
-- This script is executed when the PostgreSQL container starts for the first time

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For GIN indexes on multiple columns

-- Create database if not exists (already created via POSTGRES_DB env var)
-- But we can set some database-level settings

-- Set timezone
ALTER DATABASE airiskmgr_db SET timezone TO 'UTC';

-- Performance settings
ALTER DATABASE airiskmgr_db SET shared_buffers TO '256MB';
ALTER DATABASE airiskmgr_db SET effective_cache_size TO '1GB';
ALTER DATABASE airiskmgr_db SET maintenance_work_mem TO '64MB';

-- Connection settings
ALTER DATABASE airiskmgr_db SET max_connections TO '100';

-- Logging settings
ALTER DATABASE airiskmgr_db SET log_statement TO 'mod';
ALTER DATABASE airiskmgr_db SET log_duration TO 'on';
ALTER DATABASE airiskmgr_db SET log_min_duration_statement TO '1000'; -- Log queries > 1s

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE airiskmgr_db TO airiskmgr;

-- Create schema for application
\c airiskmgr_db;

-- Create custom types if needed
CREATE TYPE IF NOT EXISTS severity_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Create audit schema for logging
CREATE SCHEMA IF NOT EXISTS audit;
GRANT ALL ON SCHEMA audit TO airiskmgr;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Note: Tables will be created by Prisma migrations
-- This script only sets up extensions and functions

COMMENT ON EXTENSION "uuid-ossp" IS 'Generate UUIDs';
COMMENT ON EXTENSION "pg_trgm" IS 'Fuzzy text search support';
COMMENT ON EXTENSION "btree_gin" IS 'GIN index support for multiple columns';
COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically update updated_at timestamp on row modification';

-- Create indexes that Prisma might not create automatically
-- These will be created after Prisma migrations run, but we prepare the functions

-- Full-text search configuration for French language
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS french_config ( COPY = french );

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'AI Risk Manager database initialized successfully!';
    RAISE NOTICE 'Extensions: uuid-ossp, pg_trgm, btree_gin';
    RAISE NOTICE 'Database: airiskmgr_db';
    RAISE NOTICE 'User: airiskmgr';
END $$;
