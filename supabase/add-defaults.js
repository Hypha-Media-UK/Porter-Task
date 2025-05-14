// Script to insert job category defaults directly to Supabase
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the same credentials as the app
const supabaseUrl = 'https://qhetbddcmbljmirrkaac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoZXRiZGRjbWJsam1pcnJrYWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzQ2MzYsImV4cCI6MjA2MjcxMDYzNn0.R1xJDIQHl8G-t4uYDH8pDwlLd7pJCwqtWMvplaJxUmA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addDefaults() {
  try {
    console.log('Inserting default locations for job categories...');
    
    // Delete any existing defaults for Specimen Delivery
    const { error: deleteError } = await supabase
      .from('job_category_defaults')
      .delete()
      .eq('category', 'Specimen Delivery');
    
    if (deleteError) {
      console.error('Error deleting existing defaults:', deleteError);
      return;
    }
    
    // Insert a new default for Specimen Delivery
    const { data, error } = await supabase
      .from('job_category_defaults')
      .insert([
        {
          id: 'default-specimen-delivery',
          category: 'Specimen Delivery',
          item_type: null,  // Null means for all items in this category
          from_building_id: null,  // No specific from location
          from_location_id: null,
          to_building_id: 'main',
          to_location_id: 'pathology'
        }
      ]);
    
    if (error) {
      console.error('Error inserting default location:', error);
    } else {
      console.log('Default location added successfully');
      console.log('Data:', data);
    }
    
    // Verify insertion worked
    const { data: checkData, error: checkError } = await supabase
      .from('job_category_defaults')
      .select('*')
      .eq('category', 'Specimen Delivery');
    
    if (checkError) {
      console.error('Error checking defaults:', checkError);
    } else {
      console.log('Current defaults for Specimen Delivery:');
      console.log(checkData);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  } finally {
    // Close supabase connection
    // await supabase.removeAllSubscriptions();
    process.exit(0);
  }
}

// Run the function
addDefaults();
