# Supabase Database Setup and Migration Guide

This directory contains files related to Supabase database setup, migrations, and seeding.

## Files Overview

- `schema.sql` - Main database schema definition
- `seed.sql` - Initial data to populate the database
- `migration.sql` - Migration scripts for structural changes
- `run-seed.js` - Helper script to run seeding process

## Recent Updates: Job Category Default Locations

The database schema has been updated to support both "from" and "to" default locations for job categories. This enhancement allows the application to set both origin and destination locations as defaults for tasks.

### What Changed

1. The `job_category_defaults` table schema now has:
   - `from_building_id` and `from_location_id` fields for origin location
   - `to_building_id` and `to_location_id` fields for destination location
   - All location fields are optional, allowing for setting just origin, just destination, or both

2. The TypeScript interfaces have been updated to match this new structure.

### How to Apply the Migration

If you have an existing database with the old schema, you need to run the migration script:

```bash
# Connect to your Supabase database and run
psql -U postgres -d your_database_name -f migration.sql
```

Or you can execute the SQL statements directly in the Supabase SQL editor.

The migration script:
1. Creates a backup of existing data
2. Recreates the table with the new structure
3. Migrates existing data (mapping old `building_id` and `location_id` to the new `to_building_id` and `to_location_id`)

### Functionality Impact

This change supports:
- Setting default origin location for tasks
- Setting default destination location for tasks 
- Setting both origin and destination defaults
- Per category defaults or per item type defaults

The UI in the settings screen under "Task Types" tab will now properly save and display both default locations.

## Running the Application with Updated Schema

No additional steps are required to run the application after applying the migration. The application code has been updated to work with the new schema.
