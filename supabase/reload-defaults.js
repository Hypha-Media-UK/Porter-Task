/**
 * CLI script to reload default category locations
 * 
 * This script provides a command-line interface to force reload all 
 * default job category locations in the Supabase database.
 * 
 * Usage:
 *   node supabase/reload-defaults.js
 */

// Load environment variables
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://qhetbddcmbljmirrkaac.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoZXRiZGRjbWJsam1pcnJrYWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzQ2MzYsImV4cCI6MjA2MjcxMDYzNn0.R1xJDIQHl8G-t4uYDH8pDwlLd7pJCwqtWMvplaJxUmA';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function reloadDefaultLocations() {
  try {
    console.log('Starting default locations reload...');
    
    // Check if we can connect to the database
    const { data, error: connectionError } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
      
    if (connectionError) {
      console.error('Failed to connect to Supabase:', connectionError);
      return false;
    }
    
    console.log('Connected to Supabase database');
    
    // First, delete all existing job category defaults
    console.log('Removing existing job category defaults...');
    const { error: deleteError } = await supabase
      .from('job_category_defaults')
      .delete()
      .neq('id', ' '); // This will match all records
      
    if (deleteError) {
      console.error('Error deleting existing defaults:', deleteError);
      return false;
    }
    
    console.log('Successfully removed existing job category defaults');
    
    // Define our default job category defaults
    const defaultLocations = [
      // Specimen Delivery always goes to Pathology in New Fountain House
      {
        id: nanoid(),
        category: 'Specimen Delivery',
        item_type: null, // For all items in this category
        from_building_id: null,  // No specific from location
        from_location_id: null,
        to_building_id: 'new-fountain-house', 
        to_location_id: 'pathology'
      },
      // Patient Transport origin is often A+E
      {
        id: nanoid(),
        category: 'Patient Transport',
        item_type: null, // For all items in this category
        from_building_id: 'main-hospital',  
        from_location_id: 'accident-and-emergency',
        to_building_id: null, 
        to_location_id: null
      },
      // Blood always comes from Blood Bank
      {
        id: nanoid(),
        category: 'Blood',
        item_type: null, // For all items in this category
        from_building_id: 'main-hospital',  
        from_location_id: 'blood-bank',
        to_building_id: null, 
        to_location_id: null
      },
      // Notes have a common flow pattern
      {
        id: nanoid(),
        category: 'Notes',
        item_type: null, // For all items in this category
        from_building_id: 'main-hospital',  
        from_location_id: 'medical-records',
        to_building_id: null, 
        to_location_id: null
      },
      // Equipment is often from Medical Engineering
      {
        id: nanoid(),
        category: 'Equipment',
        item_type: null, // For all items in this category
        from_building_id: 'support-services',  
        from_location_id: 'medical-engineering',
        to_building_id: null, 
        to_location_id: null
      }
    ];
    
    console.log(`Adding ${defaultLocations.length} default locations:`);
    defaultLocations.forEach(def => {
      console.log(`- ${def.category}${def.item_type ? ' (' + def.item_type + ')' : ''}: ` + 
        `from ${def.from_building_id || 'any'} / ${def.from_location_id || 'any'} ` + 
        `to ${def.to_building_id || 'any'} / ${def.to_location_id || 'any'}`);
    });
    
    // Insert all defaults in one operation
    const { error } = await supabase
      .from('job_category_defaults')
      .insert(defaultLocations);
    
    if (error) {
      console.error('Error adding job category defaults:', error);
      return false;
    }
    
    console.log(`Successfully added ${defaultLocations.length} job category default locations`);
    
    // Print total number of defaults after the operation
    const { data: updatedDefaults, error: finalError } = await supabase
      .from('job_category_defaults')
      .select('*');
      
    if (finalError) {
      console.error('Error checking final defaults:', finalError);
    } else {
      console.log(`Total job category defaults now in database: ${updatedDefaults.length}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error during default locations reload:', error);
    return false;
  }
}

// Run the reload operation
reloadDefaultLocations().then(success => {
  if (success) {
    console.log('Default locations reload completed successfully');
    process.exit(0);
  } else {
    console.error('Default locations reload failed');
    process.exit(1);
  }
});
