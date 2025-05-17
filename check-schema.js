/**
 * Script to check the database schema directly
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://qhetbddcmbljmirrkaac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoZXRiZGRjbWJsam1pcnJrYWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzQ2MzYsImV4cCI6MjA2MjcxMDYzNn0.R1xJDIQHl8G-t4uYDH8pDwlLd7pJCwqtWMvplaJxUmA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    console.log('Checking database schema for job_category_defaults table...');
    
    // Query the information schema to get the column names
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'job_category_defaults' });
    
    if (error) {
      console.error('Error querying information schema:', error);
      
      // Try another method
      console.log('Trying direct SQL query...');
      
      const { data: rawResult, error: sqlError } = await supabase.from('job_category_defaults').select('*').limit(1);
      
      if (sqlError) {
        console.error('Error with direct query:', sqlError);
      } else {
        if (rawResult && rawResult.length > 0) {
          console.log('Column names from sample row:', Object.keys(rawResult[0]));
        } else {
          console.log('No rows found in the table. Here is the client-side structure we expect:');
          const expectedStructure = {
            id: 'string',
            category: 'string',
            item_type: 'string or null',
            from_building_id: 'string or null',
            from_location_id: 'string or null',
            to_building_id: 'string or null',
            to_location_id: 'string or null'
          };
          console.log(expectedStructure);
        }
      }
      
      return;
    }
    
    console.log('Columns in job_category_defaults table:', data);
    
    // Try a simpler insert with only guaranteed columns
    const testRow = {
      id: 'test-' + Date.now(),
      category: 'Test'
    };
    
    console.log('Attempting minimal insert with only id and category:', testRow);
    
    const { error: insertError } = await supabase
      .from('job_category_defaults')
      .insert([testRow]);
      
    if (insertError) {
      console.error('Error with minimal insert:', insertError);
    } else {
      console.log('Minimal insert successful - this confirms the table exists and we have permissions');
      
      // Clean up test row
      await supabase.from('job_category_defaults').delete().eq('id', testRow.id);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkSchema().then(() => {
  console.log('Schema check completed');
  process.exit(0);
});
