/**
 * Database services centralized file
 * This file re-exports all the database functions from individual service files
 * for easier organization and imports
 */

// Re-export all Supabase service functions
export * from './shiftService'
export * from './taskService'
export * from './porterAssignmentService'
export * from './settingsService'

// Import the Supabase client for direct access if needed
import { supabase } from '@/utils/supabase'
import { nanoid } from 'nanoid'
import { checkNeedsMigration } from '@/utils/databaseUtils'

/**
 * Initialize the database by creating necessary tables if they don't exist
 * This should be called when the application starts
 */
export async function initializeDatabase(): Promise<boolean> {
  try {
    console.log('Initializing Supabase database connection...')
    
    // Verify connection works by making a simple query
    const { data, error } = await supabase.from('settings').select('*').limit(1)
    
    if (error) {
      console.error('Error connecting to Supabase:', error)
      return false
    }
    
    console.log('Supabase database connection initialized successfully')
    return true
  } catch (error) {
    console.error('Failed to initialize database:', error)
    return false
  }
}

/**
 * Seed the database with initial data from localStorage or JSON files
 * This should be called after initializing the database if the database is empty
 */
/**
 * Add default job category locations
 * This is used to set up standard default locations for specific job types
 */
export async function addJobCategoryDefaults(): Promise<boolean> {
  try {
    console.log('Adding job category default locations...')
    
    // Check if specimen delivery default already exists
    const { data: existingDefaults, error: checkError } = await supabase
      .from('job_category_defaults')
      .select('*')
      .eq('category', 'Specimen Delivery')
    
    if (checkError) {
      console.error('Error checking for existing defaults:', checkError)
      return false
    }
    
    // If default already exists, no need to add it again
    if (existingDefaults && existingDefaults.length > 0) {
      console.log('Default location for Specimen Delivery already exists')
      return true
    }
    
    // First, verify the building and department exist
    const buildingId = 'new-fountain-house';
    const departmentId = 'pathology';
    
    const { data: buildings } = await supabase
      .from('buildings')
      .select('id')
      .eq('id', buildingId)
    
    const { data: departments } = await supabase
      .from('departments')
      .select('id, building_id')
      .eq('id', departmentId)
    
    // If either the building or department doesn't exist, log an error and return
    if (!buildings || buildings.length === 0) {
      console.error(`Building with ID "${buildingId}" not found`)
      return false
    }
    
    if (!departments || departments.length === 0) {
      console.error(`Department with ID "${departmentId}" not found`)
      return false
    }
    
    // Check if the department is in the expected building
    const department = departments[0];
    if (department.building_id !== buildingId) {
      console.warn(`Department "${departmentId}" exists but is in building "${department.building_id}", not "${buildingId}" as expected`);
      // Continue anyway as we'll use the correct building ID
    }
    
    // Create default for Specimen Delivery
    const { error } = await supabase
      .from('job_category_defaults')
      .insert([
        {
          id: nanoid(),
          category: 'Specimen Delivery',
          item_type: null, // For all items in this category
          from_building_id: null,  // No specific from location
          from_location_id: null,
          to_building_id: 'new-fountain-house', // Pathology is in New Fountain House
          to_location_id: 'pathology'
        }
      ])
    
    if (error) {
      console.error('Error adding job category defaults:', error)
      return false
    }
    
    console.log('Successfully added job category default locations')
    return true
  } catch (error) {
    console.error('Error adding job category defaults:', error)
    return false
  }
}

export async function seedDatabase(): Promise<boolean> {
  try {
    console.log('Checking if database needs seeding...')
    
    // Check if database already has data
    const needsSeeding = await checkNeedsMigration()
    
    // If there's already data in the key tables, assume the database is seeded
    if (!needsSeeding) {
      console.log('Database already has data, skipping seed')
      return true
    }
    
    console.log('Database is empty, seeding from local data...')
    
    // Attempt to seed from localStorage first
    let seedSuccess = await seedFromLocalStorage()
    
    // If localStorage seeding fails, try from JSON files
    if (!seedSuccess) {
      seedSuccess = await seedFromJsonFiles()
    }
    
    if (!seedSuccess) {
      console.error('Failed to seed database from any source')
      return false
    }
    
    console.log('Database seeded successfully')
    return true
  } catch (error) {
    console.error('Error seeding database:', error)
    return false
  }
}

/**
 * Seed the database from localStorage data
 */
async function seedFromLocalStorage(): Promise<boolean> {
  try {
    console.log('Attempting to seed database from localStorage...')
    
    // Check for settings in localStorage
    const settingsData = localStorage.getItem('porterTrackSettings')
    const locationsData = localStorage.getItem('porterTrackLocations')
    
    if (!settingsData || !locationsData) {
      console.log('No complete data found in localStorage')
      return false
    }
    
    // Parse the data
    const settings = JSON.parse(settingsData)
    const locations = JSON.parse(locationsData)
    
    // Use the service functions to save the data to Supabase
    await import('./settingsService').then(module => {
      return Promise.all([
        module.saveSettings(settings),
        module.saveLocations(locations)
      ])
    })
    
    console.log('Successfully seeded database from localStorage')
    return true
  } catch (error) {
    console.error('Error seeding from localStorage:', error)
    return false
  }
}

/**
 * Seed the database from JSON files
 */
async function seedFromJsonFiles(): Promise<boolean> {
  try {
    console.log('Attempting to seed database from JSON files...')
    
    // Fetch settings and locations from JSON files
    const settingsResponse = await fetch('/data/settings.json')
    const locationsResponse = await fetch('/data/locations.json')
    
    if (!settingsResponse.ok || !locationsResponse.ok) {
      console.error('Failed to fetch JSON files')
      return false
    }
    
    const settings = await settingsResponse.json()
    const locations = await locationsResponse.json()
    
    // Use the service functions to save the data to Supabase
    await import('./settingsService').then(module => {
      return Promise.all([
        module.saveSettings(settings),
        module.saveLocations(locations)
      ])
    })
    
    console.log('Successfully seeded database from JSON files')
    return true
  } catch (error) {
    console.error('Error seeding from JSON files:', error)
    return false
  }
}
