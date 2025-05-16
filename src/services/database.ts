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
    
    // Import transform function to properly format for database
    const { transformJobCategoryDefaultToSupabase } = await import('./settingsService')
    
    // Define our default job category defaults (using application camelCase format)
    const defaultLocations = [
      // Specimen Delivery always goes to Pathology in New Fountain House
      {
        category: 'Specimen Delivery',
        itemType: undefined, // For all items in this category
        fromBuildingId: undefined,  // No specific from location
        fromLocationId: undefined,
        toBuildingId: 'new-fountain-house', 
        toLocationId: 'pathology'
      },
      // Patient Transport origin is often A+E
      {
        category: 'Patient Transport',
        itemType: undefined, // For all items in this category
        fromBuildingId: 'main-hospital',  
        fromLocationId: 'accident-and-emergency',
        toBuildingId: undefined, 
        toLocationId: undefined
      },
      // Blood always comes from Blood Bank
      {
        category: 'Blood',
        itemType: undefined, // For all items in this category
        fromBuildingId: 'main-hospital',  
        fromLocationId: 'blood-bank',
        toBuildingId: undefined, 
        toLocationId: undefined
      },
      // Notes have a common flow pattern
      {
        category: 'Notes',
        itemType: undefined, // For all items in this category
        fromBuildingId: 'main-hospital',  
        fromLocationId: 'medical-records',
        toBuildingId: undefined, 
        toLocationId: undefined
      },
      // Equipment is often from Medical Engineering
      {
        category: 'Equipment',
        itemType: undefined, // For all items in this category
        fromBuildingId: 'support-services',  
        fromLocationId: 'medical-engineering',
        toBuildingId: undefined, 
        toLocationId: undefined
      }
    ];
    
    // First, check if we have any defaults already
    const { data: existingDefaults, error: checkError } = await supabase
      .from('job_category_defaults')
      .select('category, item_type')
    
    if (checkError) {
      console.error('Error checking for existing defaults:', checkError)
      return false
    }
    
    // Filter out any defaults that already exist
    const existingKeys = new Set();
    if (existingDefaults && existingDefaults.length > 0) {
      existingDefaults.forEach(def => {
        const key = `${def.category}:${def.item_type || ''}`;
        existingKeys.add(key);
      });
    }
    
    // Transform to the correct database format (snake_case)
    const newDefaultsToInsert = defaultLocations
      .filter(def => {
        const key = `${def.category}:${def.itemType || ''}`;
        return !existingKeys.has(key);
      })
      .map(def => transformJobCategoryDefaultToSupabase(def));
    
    if (newDefaultsToInsert.length === 0) {
      console.log('All default locations already exist in database');
      return true;
    }
    
    console.log(`Adding ${newDefaultsToInsert.length} new default locations`);
    
    // Insert all new defaults in one operation
    const { error } = await supabase
      .from('job_category_defaults')
      .insert(newDefaultsToInsert)
    
    if (error) {
      console.error('Error adding job category defaults:', error)
      return false
    }
    
    console.log(`Successfully added ${newDefaultsToInsert.length} job category default locations`)
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
      console.log('Database already contains data, no need to seed.')
      
      // Even if database is seeded, make sure we have job category defaults
      await addJobCategoryDefaults()
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
