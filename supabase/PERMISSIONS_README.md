# Supabase Permissions Setup

This document explains how to set up the required permissions in Supabase for the Porter Task Management app.

## Overview

The Porter Task Management app requires specific permissions to be set in your Supabase project to allow the application to:

1. Create and manage shifts
2. Add and update tasks
3. Manage porter assignments
4. Store and retrieve settings

## Setup Instructions

### Option 1: Automatic Setup (Recommended)

We've provided a script that automatically sets up all required permissions. Follow these steps:

1. Make sure you have Node.js installed on your computer
2. Open a terminal and navigate to the project directory
3. Install the Supabase JS client if you haven't already:
   ```bash
   npm install @supabase/supabase-js
   ```
4. Run the setup script with your Supabase URL and service role key:
   ```bash
   cd supabase
   SUPABASE_URL=https://qhetbddcmbljmirrkaac.supabase.co SUPABASE_KEY=your-service-role-key node setup-permissions.js
   ```

   > ⚠️ **Important**: You need to use your service role key (from Supabase dashboard under Project Settings > API), not the anon key that's used in the app.

5. The script will:
   - Enable Row Level Security (RLS) on all tables
   - Create permissive policies for the anonymous user
   - Add the `is_active` column to the shifts table if it doesn't exist

### Option 2: Manual Setup

If the automatic setup doesn't work, you can manually configure the permissions in the Supabase dashboard:

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Go to Authentication > Policies
3. For each of the following tables, create a policy that allows all operations for the anonymous user:
   - shifts
   - tasks
   - shift_assigned_porters
   - porter_assignments
   - supervisors
   - porters
   - buildings
   - departments
   - job_categories
   - job_category_defaults
   - designation_departments
   - settings

4. Make sure the `is_active` column exists in the shifts table:
   - Go to Database > Tables
   - Select the `shifts` table
   - Check if there's an `is_active` boolean column
   - If not, add it with a default value of `false`

## Troubleshooting

If you're still experiencing permission issues:

1. Check the browser console for specific error messages
2. Verify that Row Level Security is enabled for all tables
3. Confirm that your policies apply to the anonymous role
4. Make sure the service role key used in the setup script has sufficient permissions

## Security Considerations

The current permission setup allows anonymous access to all operations for simplicity. In a production environment, you might want to:

1. Implement user authentication
2. Create more restrictive policies based on user roles
3. Add additional security measures like API keys for sensitive operations

For help or further questions, please contact the development team.
