/**
 * Force update of job category defaults in Supabase
 * 
 * This script directly adds the default job category locations to the database.
 * Run this script to fix missing defaults after updating the database.ts file.
 */

// Use ES module imports (since this project has "type": "module" in package.json)
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

async function fixJobCategoryDefaults() {
  try {
    console.log('Starting job category defaults fix...');
    
    // Define our default job category defaults
    const defaultLocations = [
      // Specimen Delivery always goes to Pathology in New Fountain House
      {
        id: nanoid(),
        category: 'Specimen Delivery',
        item_type: null, // For all items in this category
        fromBuildingId: null,  // No specific from location
        fromLocationId: null,
        toBuildingId: 'new-fountain-house', 
        toLocationId: 'pathology'
      },
      // Patient Transport origin is often A+E
      {
        id: nanoid(),
        category: 'Patient Transport',
        item_type: null, // For all items in this category
        fromBuildingId: 'main-hospital',  
        fromLocationId: 'accident-and-emergency',
        toBuildingId: null, 
        toLocationId: null
      },
      // Blood always comes from Blood Bank
      {
        id: nanoid(),
        category: 'Blood',
        item_type: null, // For all items in this category
        fromBuildingId: 'main-hospital',  
        fromLocationId: 'blood-bank',
        toBuildingId: null, 
        toLocationId: null
      }
    ];
    
    // First, check if we have any defaults already
    const { data: existingDefaults, error: checkError } = await supabase
      .from('job_category_defaults')
      .select('category, item_type');
    
    if (checkError) {
      console.error('Error checking for existing defaults:', checkError);
      return false;
    }
    
    console.log(`Found ${existingDefaults ? existingDefaults.length : 0} existing defaults`);
    
    // Filter out any defaults that already exist
    const existingKeys = new Set();
    if (existingDefaults && existingDefaults.length > 0) {
      existingDefaults.forEach(def => {
        const key = `${def.category}:${def.item_type || ''}`;
        existingKeys.add(key);
      });
    }
    
    // Create an array of new defaults to insert
    const newDefaults = defaultLocations.filter(def => {
      const key = `${def.category}:${def.item_type || ''}`;
      return !existingKeys.has(key);
    });
    
    if (newDefaults.length === 0) {
      console.log('All default locations already exist in database');
      return true;
    }
    
    console.log(`Adding ${newDefaults.length} new default locations:`);
    newDefaults.forEach(def => {
      console.log(`- ${def.category}${def.item_type ? ' (' + def.item_type + ')' : ''}: ` + 
        `from ${def.fromBuildingId || 'any'} / ${def.fromLocationId || 'any'} ` + 
        `to ${def.toBuildingId || 'any'} / ${def.toLocationId || 'any'}`);
    });
    
    // Map JavaScript camelCase to database snake_case fields
    const mappedDefaults = newDefaults.map(def => ({
      id: def.id,
      category: def.category,
      item_type: def.item_type,
      from_building_id: def.fromBuildingId,
      from_location_id: def.fromLocationId,
      to_building_id: def.toBuildingId,
      to_location_id: def.toLocationId
    }));
    
    // Insert all new defaults in one operation
    const { error } = await supabase
      .from('job_category_defaults')
      .insert(mappedDefaults);
    
    if (error) {
      console.error('Error adding job category defaults:', error);
      return false;
    }
    
    console.log(`Successfully added ${newDefaults.length} job category default locations`);
    
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
    console.error('Error fixing job category defaults:', error);
    return false;
  }
}

// Run the fix
fixJobCategoryDefaults().then(success => {
  if (success) {
    console.log('Job category defaults fix completed successfully');
    process.exit(0);
  } else {
    console.error('Job category defaults fix failed');
    process.exit(1);
  }
});
