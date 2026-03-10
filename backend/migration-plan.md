# Migration Plan: JSON to Supabase PostgreSQL

## Information Gathered

- Project: Node.js backend with Express
- Current database: SQLite via Prisma
- Location: `backend/` directory
- Existing seed data: `backend/prisma/seed-data.json`

## Plan

### 1. SQL Command for Supabase

Create table `my_apps_data` with:

- `id` (uuid, primary key)
- `content` (text)
- `metadata` (jsonb)
- `embedding` (vector(1536))
- `created_at` (timestamp)

### 2. Migration Script (`migrate-to-supabase.js`)

- Use `@supabase/supabase-js` for Supabase connection
- Use `dotenv` for loading environment variables (SUPABASE_URL, SUPABASE_KEY)
- Read data from `./data.json`
- Create `migrate()` function that:
  - Loops through JSON data
  - Performs `.insert()` to `my_apps_data` table
  - Handles errors for failed inserts
  - Reports success/failure statistics

### 3. Environment Configuration

- Create `.env.example` template with SUPABASE_URL and SUPABASE_KEY

### 4. Sample Data File

- Create sample `data.json` in backend directory for migration testing

## Dependencies to Install

- @supabase/supabase-js
- dotenv

## Files to Create

1. `backend/migrate-to-supabase.js` - Main migration script
2. `backend/data.json` - Sample data file
3. `backend/.env.example` - Environment template
