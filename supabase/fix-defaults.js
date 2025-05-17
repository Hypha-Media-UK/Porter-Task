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
    
    // First, get all buildings and departments from the database
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
    
    // Create maps for looking up buildings and departments by name
    const buildingsByName = new Map();
    buildings.forEach(building => {
      buildingsByName.set(building.name.toLowerCase(), building.id);
    });
    
    // Map to find departments by [buildingId, departmentName]
    const departmentsByName = new Map();
    departments.forEach(department => {
      const buildingId = department.building_id;
      const deptName = department.name.toLowerCase();
      const key = `${buildingId}:${deptName}`;
      departmentsByName.set(key, department.id);
    });
    
    // Function to lookup department ID
    const findDepartmentId = (buildingId, departmentName) => {
      if (!buildingId || !departmentName) return null;
      const key = `${buildingId}:${departmentName.toLowerCase()}`;
      return departmentsByName.get(key) || null;
    };
    
    // Define default locations with names, not IDs
    const defaultLocationsConfig = [
      {
        category: 'Specimen Delivery',
        toBuilding: 'New Fountain House',
        toDepartment: 'Pathology'
      },
      {
        category: 'Patient Transport',
        fromBuilding: 'Main Hospital',
        fromDepartment: 'Accident and Emergency'
      },
      {
        category: 'Blood',
        fromBuilding: 'Main Hospital',
        fromDepartment: 'Blood Bank'
      },
      {
        category: 'Notes',
        fromBuilding: 'Main Hospital',
        fromDepartment: 'Medical Records'
      },
      {
        category: 'Equipment',
        fromBuilding: 'Support Services',
        fromDepartment: 'Medical Engineering'
      }
    ];
    
    // Convert the config to actual IDs based on what's in the database
    const defaultLocations = defaultLocationsConfig.map(config => {
      const result = {
        id: nanoid(),
        category: config.category,
        item_type: null
      };
      
      // Set the from location if building exists
      if (config.fromBuilding) {
        const fromBuildingId = buildingsByName.get(config.fromBuilding.toLowerCase());
        if (fromBuildingId) {
          result.fromBuildingId = fromBuildingId;
          
          // Only set department if building exists
          if (config.fromDepartment) {
            const fromDeptId = findDepartmentId(fromBuildingId, config.fromDepartment);
            if (fromDeptId) {
              result.fromLocationId = fromDeptId;
            } else {
              console.warn(`Department "${config.fromDepartment}" not found in building "${config.fromBuilding}"`);
            }
          }
        } else {
          console.warn(`Building "${config.fromBuilding}" not found in database`);
        }
      }
      
      // Set the to location if building exists
      if (config.toBuilding) {
        const toBuildingId = buildingsByName.get(config.toBuilding.toLowerCase());
        if (toBuildingId) {
          result.toBuildingId = toBuildingId;
          
          // Only set department if building exists
          if (config.toDepartment) {
            const toDeptId = findDepartmentId(toBuildingId, config.toDepartment);
            if (toDeptId) {
              result.toLocationId = toDeptId;
            } else {
              console.warn(`Department "${config.toDepartment}" not found in building "${config.toBuilding}"`);
            }
          }
        } else {
          console.warn(`Building "${config.toBuilding}" not found in database`);
        }
      }
      
      return result;
    }).filter(def => 
      // Only include defaults where at least one location was found
      (def.fromBuildingId && def.fromLocationId) || (def.toBuildingId && def.toLocationId)
    );
    
    if (defaultLocations.length === 0) {
      console.log('No valid default locations could be created - buildings/departments may not exist yet');
      return true;
    }
    
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
