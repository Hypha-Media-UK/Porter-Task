/**
 * Script to configure necessary permissions for the Porter Task app in Supabase
 * 
 * This script creates the necessary policies in Supabase to allow the anonymous user
 * to perform all required operations on the database tables.
 * 
 * Run this with Node.js after setting the SUPABASE_URL and SUPABASE_KEY environment variables:
 * 
 * SUPABASE_URL=your-project-url SUPABASE_KEY=your-service-role-key node setup-permissions.js
 */

const { createClient } = require('@supabase/supabase-js');

// Check for required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set');
  console.error('Please set them to your Supabase project URL and service role key');
  console.error('Example: SUPABASE_URL=https://xyz.supabase.co SUPABASE_KEY=your-service-role-key node setup-permissions.js');
  process.exit(1);
}

// Create a Supabase client with the service role key (admin access)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Anonymous policy names for each table
const POLICY_NAMES = {
  shifts: 'Porter Task App - Enable all operations on shifts',
  tasks: 'Porter Task App - Enable all operations on tasks',
  shift_assigned_porters: 'Porter Task App - Enable all operations on shift_assigned_porters',
  porter_assignments: 'Porter Task App - Enable all operations on porter_assignments',
  supervisors: 'Porter Task App - Enable all operations on supervisors',
  porters: 'Porter Task App - Enable all operations on porters',
  buildings: 'Porter Task App - Enable all operations on buildings',
  departments: 'Porter Task App - Enable all operations on departments',
  job_categories: 'Porter Task App - Enable all operations on job_categories',
  job_category_defaults: 'Porter Task App - Enable all operations on job_category_defaults',
  designation_departments: 'Porter Task App - Enable all operations on designation_departments',
  settings: 'Porter Task App - Enable all operations on settings'
};

/**
 * Create enable_all policy for a table
 */
async function createEnableAllPolicy(tableName, policyName) {
  try {
    // Try to drop the policy if it exists
    try {
      const { error: dropError } = await supabase.rpc('drop_policy_if_exists', {
        table_name: tableName,
        policy_name: policyName
      });
      
      if (dropError) {
        console.warn(`Warning: Failed to drop existing policy on ${tableName}: ${dropError.message}`);
        // Continue anyway
      }
    } catch (dropErr) {
      console.warn(`Warning: Failed to check/drop existing policy on ${tableName}: ${dropErr.message}`);
      // Continue anyway
    }
    
    // Create the policy allowing all operations for the anon role
    const { error } = await supabase.rpc('create_policy', {
      table_name: tableName,
      policy_name: policyName,
      definition: 'true',
      check_expression: 'true',
      for_command: 'ALL',
      roles: ['anon', 'authenticated']
    });
    
    if (error) {
      console.error(`Error creating policy for ${tableName}:`, error);
      return false;
    }
    
    console.log(`✓ Created policy for ${tableName}`);
    return true;
  } catch (err) {
    console.error(`Error for table ${tableName}:`, err.message);
    return false;
  }
}

/**
 * Main function to set all required permissions
 */
async function setupPermissions() {
  console.log('====== Porter Task App - Setting up Supabase permissions ======');
  
  // Check connection
  try {
    const { data, error } = await supabase.from('shifts').select('id').limit(1);
    if (error) {
      console.error('Failed to connect to Supabase:', error);
      return;
    }
    console.log('Successfully connected to Supabase');
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return;
  }
  
  // Enable row level security on all tables
  console.log('\n--- Enabling row level security ---');
  for (const tableName of Object.keys(POLICY_NAMES)) {
    try {
      const { error } = await supabase.rpc('enable_rls', {
        table_name: tableName
      });
      
      if (error) {
        console.warn(`Warning: Failed to enable RLS on ${tableName}: ${error.message}`);
        // Continue anyway
      } else {
        console.log(`✓ Enabled RLS on ${tableName}`);
      }
    } catch (err) {
      console.warn(`Warning: Failed to enable RLS on ${tableName}: ${err.message}`);
      // Continue anyway
    }
  }
  
  // Create policies for all tables
  console.log('\n--- Creating access policies ---');
  let successCount = 0;
  
  for (const [tableName, policyName] of Object.entries(POLICY_NAMES)) {
    const success = await createEnableAllPolicy(tableName, policyName);
    if (success) successCount++;
  }
  
  // Add the is_active column to shifts table if it doesn't exist
  console.log('\n--- Checking and adding is_active column ---');
  try {
    // Check if column exists
    const { data, error } = await supabase.rpc('column_exists', {
      table_name: 'shifts',
      column_name: 'is_active'
    });
    
    if (error) {
      console.warn('Warning: Failed to check if is_active column exists:', error.message);
    } else if (!data) {
      console.log('Adding is_active column to shifts table...');
      
      const { error: addError } = await supabase.rpc('add_column', {
        table_name: 'shifts',
        column_name: 'is_active',
        column_type: 'boolean',
        column_default: 'false'
      });
      
      if (addError) {
        console.error('Error adding is_active column:', addError.message);
      } else {
        console.log('✓ Added is_active column to shifts table');
      }
    } else {
      console.log('✓ is_active column already exists on shifts table');
    }
  } catch (err) {
    console.warn('Warning: Failed to check/add is_active column:', err.message);
  }
  
  console.log('\n====== Setup Summary ======');
  console.log(`Successfully created ${successCount} out of ${Object.keys(POLICY_NAMES).length} policies`);
  
  if (successCount === Object.keys(POLICY_NAMES).length) {
    console.log('\n✅ All permissions have been set up successfully!');
    console.log('The Porter Task app should now work correctly with Supabase');
  } else {
    console.log('\n⚠️ Some permissions could not be set up automatically');
    console.log('You may need to configure some permissions manually in the Supabase dashboard:');
    console.log('1. Go to https://app.supabase.com/project/_/auth/policies');
    console.log('2. For each table, create a policy allowing all operations for the anon role');
  }
  
  console.log('\nImportant: You will need to restart your application for changes to take effect.');
}

// Run the main function
setupPermissions().catch(error => {
  console.error('Unhandled error during setup:', error);
  process.exit(1);
});
