/**
 * Test script to verify default locations are saving properly
 * 
 * This script tests the creation and validation of job category defaults
 * to ensure they can be properly saved to the database.
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://qhetbddcmbljmirrkaac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoZXRiZGRjbWJsam1pcnJrYWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzQ2MzYsImV4cCI6MjA2MjcxMDYzNn0.R1xJDIQHl8G-t4uYDH8pDwlLd7pJCwqtWMvplaJxUmA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDefaultLocations() {
  try {
    console.log('Starting default locations test...');
    
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
      id: 'test-default-' + Date.now(),
      category: testCategory,
      item_type: null,
      from_building_id: testBuilding.id,
      from_location_id: testDepartment.id,
      to_building_id: null,
      to_location_id: null
    };
    
    console.log('Attempting to save default:', testDefault);
    
    // Delete any existing defaults for this category
    const { error: deleteError } = await supabase
      .from('job_category_defaults')
      .delete()
      .eq('category', testCategory)
      .is('item_type', null);
    
    if (deleteError) {
      console.error('Error deleting existing defaults:', deleteError);
      return false;
    }
    
    // Insert the new default
    const { data: insertData, error: insertError } = await supabase
      .from('job_category_defaults')
      .insert([testDefault])
      .select();
    
    if (insertError) {
      console.error('Error inserting test default:', insertError);
      return false;
    }
    
    console.log(`Successfully created test default for ${testCategory}:`, {
      fromBuilding: testBuilding.name,
      fromDepartment: testDepartment.name
    });
    
    // Log the result for debugging
    if (insertError) {
      console.error('Error inserting test default:', insertError);
      
      // Attempt to debug by checking if the table exists and its structure
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_definition', { table_name: 'job_category_defaults' });
      
      if (tableError) {
        console.error('Error getting table definition:', tableError);
      } else {
        console.log('Table definition:', tableInfo);
      }
      
      return false;
    } else {
      console.log('Insert data result:', insertData);
    }
    
    // 4. Verify the default was saved correctly
    const { data: savedDefault, error: verifyError } = await supabase
      .from('job_category_defaults')
      .select('*')
      .eq('id', testDefault.id)
      .single();
    
    if (verifyError) {
      console.error('Error verifying saved default:', verifyError);
      return false;
    }
    
    console.log('Test default was successfully retrieved from database:', savedDefault);
    
    // Check that the saved values match what we sent
    const isCorrect = 
      savedDefault.category === testDefault.category &&
      savedDefault.from_building_id === testDefault.from_building_id &&
      savedDefault.from_location_id === testDefault.from_location_id;
    
    if (isCorrect) {
      console.log('✅ TEST PASSED: Default location was correctly saved and retrieved');
      return true;
    } else {
      console.error('❌ TEST FAILED: Saved default does not match expected values');
      console.log('Expected:', testDefault);
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
