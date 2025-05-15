# Shift Active Flag Migration

This migration adds an `is_active` flag to the shifts table to make active shift detection more reliable.

## Overview

The migration does the following:

1. Adds the `is_active` boolean column to the `shifts` table (with a default value of `false`)
2. Creates a PostgreSQL trigger to ensure only one shift can be active at a time
3. Updates existing shifts to set the active flag properly (the most recent shift without an end time will be marked as active)

## Running the Migration

The migration can be run in two ways:

### 1. Through the Application

The migration will automatically run the first time the application is started after upgrading. The application checks if the `is_active` column exists, and if not, it will run the migration automatically.

### 2. Manually (Server-side)

If you need to run the migration manually, you can do so using Node.js:

```bash
# Navigate to the project directory
cd /path/to/project

# Run the migration script
node -e "require('./src/utils/runMigration.js').runMigration()"
```

> **Note:** The `runMigration.js` file uses Node.js modules (`fs` and `path`) that are not available in the browser. This is why you'll see warnings during the build process about these modules being externalized. This is expected and won't affect the application's functionality, as this code only runs during initialization or on the server.

## Verification

After running the migration, you can verify it was successful by checking if any shifts are marked as active:

```sql
SELECT id, date, supervisor, is_active FROM shifts WHERE is_active = true;
```

There should be at most one active shift at any time.

## Changes to Application Logic

The migration also updates the application code to:

1. Use the `is_active` flag instead of checking for `end_time = null` to determine the active shift
2. Set the flag to `true` when creating a new shift
3. Set the flag to `false` when ending a shift
4. Set the flag to `true` when reopening an archived shift
5. Update the `isShiftActive` computed property to check the `isActive` property

These changes make the active shift detection more reliable, especially during application startup and page refreshes.
