/**
 * Test Supabase Connection and Database Setup
 * 
 * This script tests the connection to the Supabase database,
 * runs the database initialization, and ensures all required
 * data structures are in place.
 * 
 * Usage:
 *   node test-supabase-connection.js
 */

// Load environment variables
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the provided credentials
const supabaseUrl = process.env.SUPABASE_URL || 'https://qhetbddcmbljmirrkaac.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoZXRiZGRjbWJsam1pcnJrYWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzQ2MzYsImV4cCI6MjA2MjcxMDYzNn0.R1xJDIQHl8G-t4uYDH8pDwlLd7pJCwqtWMvplaJxUmA';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Using provided Supabase credentials');

const supabase = createClient(supabaseUrl, supabaseKey);

// Test functions
async function testConnection() {
  try {
    console.log('\n1. Testing Supabase connection...');
    const { data, error } = await supabase.from('settings').select('*').limit(1);
    
    if (error) {
      console.error('Connection failed:', error);
      return false;
    }
    
    console.log('Connection successful!');
    console.log(`Retrieved settings data: ${JSON.stringify(data)}`);
    return true;
  } catch (error) {
    console.error('Connection test failed with exception:', error);
    return false;
  }
}

async function checkTables() {
  try {
    console.log('\n2. Checking required tables...');
    
    // List of all required tables
    const requiredTables = [
      'settings',
      'supervisors',
      'porters',
      'buildings',
      'departments',
      'job_categories',
      'job_category_defaults',
      'designation_departments',
      'shifts',
      'tasks',
      'porter_assignments',
      'shift_assigned_porters'
    ];
    
    // Test each table with a simple query
    const results = await Promise.all(
      requiredTables.map(async (table) => {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (error) {
            console.error(`Table '${table}' error:`, error);
            return { table, exists: false, error: error.message };
          }
          
          return { 
            table, 
            exists: true, 
            count: Array.isArray(data) ? data.length : 0 
          };
        } catch (err) {
          console.error(`Error checking table '${table}':`, err);
          return { table, exists: false, error: err.message };
        }
      })
    );
    
    // Print results
    console.log('Table check results:');
    results.forEach(result => {
      if (result.exists) {
        console.log(`✅ ${result.table} - exists${result.count > 0 ? ` (contains data)` : ''}`);
      } else {
        console.log(`❌ ${result.table} - error: ${result.error}`);
      }
    });
    
    // Return true if all tables exist
    return results.every(r => r.exists);
  } catch (error) {
    console.error('Table check failed with exception:', error);
    return false;
  }
}

async function checkJobCategoryDefaults() {
  try {
    console.log('\n3. Checking job category defaults...');
    
    const { data, error } = await supabase
      .from('job_category_defaults')
      .select('*');
    
    if (error) {
      console.error('Error querying job category defaults:', error);
      return false;
    }
    
    if (data && data.length > 0) {
      console.log(`Found ${data.length} job category defaults:`);
      data.forEach(def => {
        console.log(`- ${def.category}${def.item_type ? ' (' + def.item_type + ')' : ''}: ` + 
          `from ${def.from_building_id || 'any'} / ${def.from_location_id || 'any'} ` + 
          `to ${def.to_building_id || 'any'} / ${def.to_location_id || 'any'}`);
      });
    } else {
      console.log('No job category defaults found');
    }
    
    return true;
  } catch (error) {
    console.error('Job category defaults check failed with exception:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting Supabase connection test...');
  
  // Test 1: Basic connection
  const connected = await testConnection();
  if (!connected) {
    console.error('\nFailed to connect to Supabase. Please check your credentials.');
    process.exit(1);
  }
  
  // Test 2: Check tables
  const tablesExist = await checkTables();
  if (!tablesExist) {
    console.warn('\nSome tables may not exist or cannot be accessed.');
    // Continue anyway
  }
  
  // Test 3: Check job category defaults
  await checkJobCategoryDefaults();
  
  console.log('\nConnection tests completed.');
}

// Run the tests
main().catch(error => {
  console.error('Testing failed with exception:', error);
  process.exit(1);
});
