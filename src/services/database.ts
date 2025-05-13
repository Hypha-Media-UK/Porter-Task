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
export async function seedDatabase(): Promise<boolean> {
  try {
    console.log('Checking if database needs seeding...')
    
    // Check if database already has data
    const { count, error } = await supabase
      .from('settings')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.error('Error checking database:', error)
      return false
    }
    
    // If there's already data in the settings table, assume the database is seeded
    if (count !== null && count > 0) {
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
