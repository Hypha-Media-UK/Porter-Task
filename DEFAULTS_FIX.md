# Job Category Default Locations Fix

## Problem

The functionality to apply default origin and/or destination locations when creating tasks wasn't working properly. When selecting job categories like "Specimen Delivery," the system should automatically pre-fill locations (such as Pathology for specimen deliveries), but this functionality was either not working or inconsistently applied.

## Diagnosis

After investigating the code, we identified several issues:

1. **Database Integration**: The default job category locations were not being properly seeded in the Supabase database.
2. **Limited Defaults**: Only one hardcoded default for Specimen Delivery existed, with no systematic way to add more.
3. **Debugging Visibility**: The location selection process lacked detailed logging to identify matching problems.
4. **Database Refresh**: The code wasn't checking for defaults when the database was already seeded.

## Solution

We've made the following changes to fix these issues:

1. **Enhanced `addJobCategoryDefaults()` in `src/services/database.ts`**:
   - Added support for multiple default categories (Specimen Delivery, Patient Transport, Blood)
   - Improved matching algorithm to detect existing defaults
   - Added detailed logging

2. **Improved `seedDatabase()` in `src/services/database.ts`**:
   - Added call to `addJobCategoryDefaults()` even when database already contains data
   - This ensures defaults are added during normal database operations

3. **Enhanced `applyDefaultLocations()` in `src/views/TaskFormView.vue`**:
   - Added detailed grouped logging for better debugging
   - Improved error handling with helpful diagnostic messages
   - Added fallback matching for building IDs when exact matches fail

4. **Created "Fix Defaults" Utility Script**:
   - Added `supabase/fix-defaults.js` that can be run manually to force-add all missing defaults

## How to Run the Fix

If you want to manually ensure all default locations are properly set:

1. Navigate to the project root directory
2. Install dependencies if needed: `npm install`
3. Run the fix utility:

```bash
node -r esm supabase/fix-defaults.js
```

This will check for existing defaults and add any missing ones directly to your Supabase database.

## Testing the Fix

To test if the fix is working:

1. Run the application
2. Create a new task
3. Select one of these job categories:
   - "Specimen Delivery" (should set destination to Pathology in New Fountain House)
   - "Patient Transport" (should set origin to A+E in Main Hospital)
   - "Blood" (should set origin to Blood Bank in Main Hospital)

The appropriate location should be automatically selected when you choose the job category.

## Troubleshooting

If defaults are still not appearing:

1. Check browser console for detailed logging (look for "🔍 Looking for default locations" groups)
2. Verify location IDs match between the default settings and your actual locations
3. Run the fix utility script above to ensure defaults are properly added to the database
