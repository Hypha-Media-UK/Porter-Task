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
    
    // First, get all buildings and departments from the database
    const { data: buildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('id, name')
    
    if (buildingsError) {
      console.error('Error fetching buildings:', buildingsError)
      return false
    }
    
    const { data: departments, error: departmentsError } = await supabase
      .from('departments')
      .select('id, building_id, name')
    
    if (departmentsError) {
      console.error('Error fetching departments:', departmentsError)
      return false
    }
    
    // Create maps for looking up buildings and departments by name
    const buildingsByName = new Map()
    buildings.forEach(building => {
      buildingsByName.set(building.name.toLowerCase(), building.id)
    })
    
    // Map to find departments by [buildingId, departmentName]
    const departmentsByName = new Map()
    departments.forEach(department => {
      const buildingId = department.building_id
      const deptName = department.name.toLowerCase()
      const key = `${buildingId}:${deptName}`
      departmentsByName.set(key, department.id)
    })
    
    // Function to lookup department ID
    const findDepartmentId = (buildingId: string, departmentName: string): string | undefined => {
      if (!buildingId || !departmentName) return undefined
      const key = `${buildingId}:${departmentName.toLowerCase()}`
      return departmentsByName.get(key)
    }
    
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
    ]
    
    // Convert the config to actual IDs based on what's in the database
    const defaultLocations = defaultLocationsConfig.map(config => {
      const result: any = {
        category: config.category,
        itemType: undefined
      }
      
      // Set the from location if building exists
      if (config.fromBuilding) {
        const fromBuildingId = buildingsByName.get(config.fromBuilding.toLowerCase())
        if (fromBuildingId) {
          result.fromBuildingId = fromBuildingId
          
          // Only set department if building exists
          if (config.fromDepartment) {
            const fromDeptId = findDepartmentId(fromBuildingId, config.fromDepartment)
            if (fromDeptId) {
              result.fromLocationId = fromDeptId
            } else {
              console.warn(`Department "${config.fromDepartment}" not found in building "${config.fromBuilding}"`)
            }
          }
        } else {
          console.warn(`Building "${config.fromBuilding}" not found in database`)
        }
      }
      
      // Set the to location if building exists
      if (config.toBuilding) {
        const toBuildingId = buildingsByName.get(config.toBuilding.toLowerCase())
        if (toBuildingId) {
          result.toBuildingId = toBuildingId
          
          // Only set department if building exists
          if (config.toDepartment) {
            const toDeptId = findDepartmentId(toBuildingId, config.toDepartment)
            if (toDeptId) {
              result.toLocationId = toDeptId
            } else {
              console.warn(`Department "${config.toDepartment}" not found in building "${config.toBuilding}"`)
            }
          }
        } else {
          console.warn(`Building "${config.toBuilding}" not found in database`)
        }
      }
      
      return result
    }).filter(def => 
      // Only include defaults where at least one location was found
      (def.fromBuildingId && def.fromLocationId) || (def.toBuildingId && def.toLocationId)
    )
    
    if (defaultLocations.length === 0) {
      console.log('No valid default locations could be created - buildings/departments may not exist yet')
      return true
    }
    
    // Check if we have any defaults already
    const { data: existingDefaults, error: checkError } = await supabase
      .from('job_category_defaults')
      .select('category, item_type')
    
    if (checkError) {
      console.error('Error checking for existing defaults:', checkError)
      return false
    }
    
    // Filter out any defaults that already exist
    const existingKeys = new Set()
    if (existingDefaults && existingDefaults.length > 0) {
      existingDefaults.forEach(def => {
        const key = `${def.category}:${def.item_type || ''}`
        existingKeys.add(key)
      })
    }
    
    // Transform to the correct database format and filter out existing defaults
    const newDefaultsToInsert = defaultLocations
      .filter(def => {
        const key = `${def.category}:${def.itemType || ''}`
        return !existingKeys.has(key)
      })
      .map(def => transformJobCategoryDefaultToSupabase(def))
    
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
