/**
 * Supabase Database Seeding Script
 * 
 * This script helps seed the Supabase database with initial data.
 * It reads the schema.sql and seed.sql files and runs them against the Supabase API.
 * 
 * Usage:
 *   node run-seed.js
 * 
 * Make sure to set the SUPABASE_URL and SUPABASE_KEY environment variables
 * before running this script.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://qhetbddcmbljmirrkaac.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoZXRiZGRjbWJsam1pcnJrYWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzQ2MzYsImV4cCI6MjA2MjcxMDYzNn0.R1xJDIQHl8G-t4uYDH8pDwlLd7pJCwqtWMvplaJxUmA';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read SQL files
const schemaPath = path.join(__dirname, 'schema.sql');
const seedPath = path.join(__dirname, 'seed.sql');

async function runSQLFile(filePath, description) {
  try {
    console.log(`Reading ${description} file...`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split SQL into separate statements
    // This is a simplified approach and might not work for all SQL statements
    const statements = sql
      .replace(/--.*$/gm, '') // Remove comments
      .split(';')
      .filter(statement => statement.trim().length > 0);
    
    console.log(`Found ${statements.length} SQL statements in ${description}`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        // Use Supabase's rpc to execute raw SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error.message);
          console.error('Statement:', statement);
        } else {
          console.log(`Successfully executed statement ${i + 1}`);
        }
      } catch (stmtError) {
        console.error(`Error executing statement ${i + 1}:`, stmtError.message);
        console.error('Statement:', statement);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error processing ${description} file:`, error.message);
    return false;
  }
}

async function seedDatabase() {
  console.log('Starting database seeding process...');
  
  // Check if we can connect to Supabase
  const { data: versionData, error: versionError } = await supabase.rpc('get_pg_version');
  
  if (versionError) {
    console.error('Error connecting to Supabase:', versionError.message);
    console.error('Please check your SUPABASE_URL and SUPABASE_KEY environment variables');
    console.error('You may need to create a PostgreSQL function for executing arbitrary SQL:');
    console.error(`
    CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS text AS $$
    BEGIN
      EXECUTE sql;
      RETURN 'SQL executed successfully';
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    return;
  }
  
  console.log('Connected to Supabase PostgreSQL version:', versionData);
  
  // Run schema file
  const schemaResult = await runSQLFile(schemaPath, 'schema');
  if (!schemaResult) {
    console.error('Failed to apply schema. Aborting.');
    return;
  }
  
  console.log('Schema applied successfully!');
  
  // Run seed file
  const seedResult = await runSQLFile(seedPath, 'seed');
  if (!seedResult) {
    console.error('Failed to seed database. Aborting.');
    return;
  }
  
  console.log('Database seeded successfully!');
}

// Run the seed process
seedDatabase().catch(error => {
  console.error('Unhandled error during seeding:', error);
  process.exit(1);
});
