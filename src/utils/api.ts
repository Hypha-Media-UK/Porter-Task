/**
 * Utility functions for API calls
 */
import * as db from '../services/database'
import type { SettingsData, LocationsData } from '@/types'

/**
 * Save settings to the backend
 * @param settingsData The settings data to save
 * @returns Promise with the API response
 */
export async function saveSettings(settingsData: SettingsData): Promise<any> {
  try {
    await db.saveSettings(settingsData)
    return { 
      success: true, 
      message: 'Settings saved successfully' 
    }
  } catch (error) {
    console.error('Error saving settings:', error)
    throw error
  }
}

/**
 * Save locations to the backend
 * @param locationsData The locations data to save
 * @returns Promise with the API response
 */
export async function saveLocations(locationsData: LocationsData): Promise<any> {
  try {
    await db.saveLocations(locationsData)
    return { 
      success: true, 
      message: 'Locations saved successfully' 
    }
  } catch (error) {
    console.error('Error saving locations:', error)
    throw error
  }
}

/**
 * Migrate data from localStorage to Supabase
 * @returns Promise with the API response
 */
export async function migrateData(): Promise<any> {
  try {
    const initialized = await db.initializeDatabase()
    if (!initialized) {
      throw new Error('Failed to initialize database connection')
    }
    
    const seeded = await db.seedDatabase()
    return { 
      success: seeded, 
      message: seeded ? 'Data migrated successfully' : 'Failed to migrate data'
    }
  } catch (error) {
    console.error('Error migrating data:', error)
    throw error
  }
}
