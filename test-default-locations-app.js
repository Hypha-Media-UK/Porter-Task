/**
 * Test script to verify default locations are saving properly
 * using the application's own utility functions
 */

import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

// Initialize Supabase client
const supabaseUrl = 'https://qhetbddcmbljmirrkaac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoZXRiZGRjbWJsam1pcnJrYWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzQ2MzYsImV4cCI6MjA2MjcxMDYzNn0.R1xJDIQHl8G-t4uYDH8pDwlLd7pJCwqtWMvplaJxUmA';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to transform the data to the format expected by Supabase
function transformJobCategoryDefaultToSupabase(defaultData) {
  return {
    id: nanoid(),
    category: defaultData.category,
    item_type: defaultData.itemType || null,
    from_building_id: defaultData.fromBuildingId || null,
    from_location_id: defaultData.fromLocationId || null,
    to_building_id: defaultData.toBuildingId || null,
    to_location_id: defaultData.toLocationId || null
  };
}

async function testDefaultLocations() {
  try {
    console.log('Starting application-based default locations test...');
    
    // Get the schema for the job_category_defaults table
    console.log('Checking database schema...');
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (tablesError) {
      console.error('Error getting tables:', tablesError);
      // Even if we can't get the tables, we'll continue with the test
    } else {
      console.log('Tables in the database:', tables.map(t => t.tablename).join(', '));
      
      // Check if our table exists
      if (!tables.some(t => t.tablename === 'job_category_defaults')) {
        console.error('job_category_defaults table does not exist in the database!');
      }
    }
    
    // 1. First, fetch all buildings and departments to work with real data
    console.log('Fetching buildings and departments...');
    
    const { data: buildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('id, name');
    
    if (buildingsError) {
      console.error('Error fetching buildings:', buildingsError);
      return false;
    }
    
    const { data: departments, error: departmentsError } = await supabase
      .from('departments')
      .select('id, building_id, name');
    
    if (departmentsError) {
      console.error('Error fetching departments:', departmentsError);
      return false;
    }
    
    console.log(`Found ${buildings.length} buildings and ${departments.length} departments`);
    
    if (buildings.length === 0 || departments.length === 0) {
      console.error('Not enough data to test with: need at least 1 building and 1 department');
      return false;
    }
    
    // Select a building and department to use for testing
    const testBuilding = buildings[0];
    
    // Find a department that belongs to the test building
    const buildingDepartments = departments.filter(d => d.building_id === testBuilding.id);
    
    if (buildingDepartments.length === 0) {
      console.error(`No departments found for building ${testBuilding.name} (${testBuilding.id})`);
      return false;
    }
    
    const testDepartment = buildingDepartments[0];
    
    console.log(`Selected test building: ${testBuilding.name} (${testBuilding.id})`);
    console.log(`Selected test department: ${testDepartment.name} (${testDepartment.id})`);
    
    // 2. Create a test job category if it doesn't exist
    const testCategory = 'Test Category';
    
    // Check if the category already exists
    const { data: existingCategories, error: checkCatError } = await supabase
      .from('job_categories')
      .select('category')
      .eq('category', testCategory)
      .is('item_type', null);
    
    if (checkCatError) {
      console.error('Error checking for existing category:', checkCatError);
      return false;
    }
    
    // If not, create it
    if (!existingCategories || existingCategories.length === 0) {
      const { error: createCatError } = await supabase
        .from('job_categories')
        .insert({
          id: 'test-category-' + Date.now(),
          category: testCategory,
          item_type: null
        });
      
      if (createCatError) {
        console.error('Error creating test category:', createCatError);
        return false;
      }
      
      console.log(`Created test category: ${testCategory}`);
    } else {
      console.log(`Test category already exists: ${testCategory}`);
    }
    
    // 3. Create a test default with the selected building and department
    const testDefault = {
      category: testCategory,
      itemType: null, // using camelCase as in the app
      fromBuildingId: testBuilding.id, // using camelCase as in the app
      fromLocationId: testDepartment.id, // using camelCase as in the app
      toBuildingId: null,
      toLocationId: null
    };
    
    console.log('Original test default object:', testDefault);
    
    // Transform the default to snake_case for Supabase
    const transformedDefault = transformJobCategoryDefaultToSupabase(testDefault);
    
    console.log('Transformed test default object:', transformedDefault);
    
    // Delete any existing defaults for this category
    console.log(`Deleting existing defaults for category: ${testCategory}`);
    const { error: deleteError } = await supabase
      .from('job_category_defaults')
      .delete()
      .eq('category', testCategory)
      .is('item_type', null);
    
    if (deleteError) {
      console.error('Error deleting existing defaults:', deleteError);
      return false;
    }
    
    console.log('Attempting to insert the new default...');
    
    // Insert the new default
    const { data: insertData, error: insertError } = await supabase
      .from('job_category_defaults')
      .insert([transformedDefault]);
    
    if (insertError) {
      console.error('Error inserting test default:', insertError);
      return false;
    }
    
    console.log('Default location successfully inserted!');
    
    // 4. Verify the default was saved correctly
    console.log(`Verifying default was saved correctly (ID: ${transformedDefault.id})...`);
    const { data: savedDefaults, error: verifyError } = await supabase
      .from('job_category_defaults')
      .select('*')
      .eq('id', transformedDefault.id);
    
    if (verifyError) {
      console.error('Error verifying saved default:', verifyError);
      return false;
    }
    
    if (!savedDefaults || savedDefaults.length === 0) {
      console.error('Default not found in database after insertion');
      return false;
    }
    
    const savedDefault = savedDefaults[0];
    console.log('Saved default retrieved from database:', savedDefault);
    
    // Check that the saved values match what we sent
    const isCorrect = 
      savedDefault.category === transformedDefault.category &&
      savedDefault.from_building_id === transformedDefault.from_building_id &&
      savedDefault.from_location_id === transformedDefault.from_location_id;
    
    if (isCorrect) {
      console.log('✅ TEST PASSED: Default location was correctly saved and retrieved');
      return true;
    } else {
      console.error('❌ TEST FAILED: Saved default does not match expected values');
      console.log('Expected:', transformedDefault);
      console.log('Actual:', savedDefault);
      return false;
    }
  } catch (error) {
    console.error('Unexpected error during test:', error);
    return false;
  }
}

// Run the test
testDefaultLocations().then(success => {
  if (success) {
    console.log('Default locations test completed successfully');
    process.exit(0);
  } else {
    console.error('Default locations test failed');
    process.exit(1);
  }
});
