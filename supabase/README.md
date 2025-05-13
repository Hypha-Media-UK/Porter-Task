# Supabase Setup for Porter Task Management App

This directory contains the necessary files to set up a Supabase database for the Porter Task Management application.

## Setup Instructions

1. Log into the [Supabase Dashboard](https://app.supabase.com)
2. Open your project (or create a new one if needed)
3. Go to the SQL Editor section
4. Create a new query and run the commands in the following order:
   - First run `schema.sql` to create all required tables
   - Then run `seed.sql` to populate the tables with initial data

## Database Structure

The Porter Task Management app uses the following tables:

- `settings`: Application-wide settings like shift times
- `supervisors`: List of supervisors
- `porters`: List of porters
- `buildings`: Hospital buildings
- `departments`: Departments within buildings (including wards)
- `job_categories`: Job categories and their item types
- `job_category_defaults`: Default locations for job categories
- `designation_departments`: Department designations for porter assignments
- `shifts`: Shift data (day/night, supervisor, times)
- `tasks`: Tasks within shifts
- `porter_assignments`: Time-based department assignments for porters
- `shift_assigned_porters`: Tracks which porters are assigned to which shifts

## Seed Data

The `seed.sql` file populates the database with initial data extracted from the app's previous JSON-based storage:

- 5 supervisors
- 10 porters
- 11 buildings
- 50+ departments across all buildings
- 16 job categories with their item types
- Default job category locations
- Designation departments for porter assignments with predefined colors

The seed file first truncates all tables to ensure a clean start, then populates them with the initial data. This ensures the app will work correctly with the same reference data it had before the migration to Supabase.

## Row-Level Security (RLS)

By default, Supabase applies strict Row-Level Security. For this application, anonymous access is needed since we're not implementing user authentication. To enable this:

1. Go to the Authentication > Policies section in your Supabase dashboard
2. For each table, create a policy named "Anonymous access" with the following:
   - Policy definition: `true`
   - Policy statements: Select, Insert, Update, Delete 
   - Target roles: `anon`

This allows full access to all tables without authentication, which is appropriate for this demo application but would need to be restricted in a production environment.

## Environment Variables

The application expects the following environment variables:

```
SUPABASE_URL=https://qhetbddcmbljmirrkaac.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoZXRiZGRjbWJsam1pcnJrYWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzQ2MzYsImV4cCI6MjA2MjcxMDYzNn0.R1xJDIQHl8G-t4uYDH8pDwlLd7pJCwqtWMvplaJxUmA
```

These are already configured in the `src/utils/supabase.ts` file.

## Data Migration

When the application starts, it will:

1. Check if the Supabase database is empty
2. If empty, attempt to migrate data from the following sources (in order):
   - localStorage (if the app has been used previously)
   - JSON files (from public/data directory)

This ensures a smooth transition from the local storage version to the Supabase-backed version.
