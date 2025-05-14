import { initializeSupabase, ensureTablesExist } from './supabase'
import { initializeDatabase, seedDatabase } from '../services/database'
import { checkNeedsMigration } from './databaseUtils'

/**
 * Initialize Supabase connection and prepare the database
 * @returns Promise<boolean> indicating if initialization was successful
 */
export async function initializeApp(): Promise<boolean> {
  try {
    console.log('Initializing application...')
    
    // Step 1: Initialize Supabase connection
    const supabaseInitialized = await initializeSupabase()
    if (!supabaseInitialized) {
      console.error('Failed to initialize Supabase connection')
      return false
    }
    
    // Step 2: Ensure all required tables exist
    const tablesExist = await ensureTablesExist()
    if (!tablesExist) {
      console.warn('Some tables may not exist. Application might not function correctly.')
      // Continue anyway, as tables might be created by migrations
    }
    
    // Step 3: Initialize database connections
    const dbInitialized = await initializeDatabase()
    if (!dbInitialized) {
      console.error('Failed to initialize database connection')
      return false
    }
    
    // Step 4: Check if the database should be seeded
    const needsMigration = await checkNeedsMigration()
    if (needsMigration) {
      console.log('Database appears empty. Attempting to seed data...')
      // Step 5: Seed the database if empty
      const dbSeeded = await seedDatabase()
      if (!dbSeeded) {
        console.warn('Database seeding may have failed. App will use fallback data sources.')
        // Continue anyway as we have fallbacks to localStorage and JSON files
      } else {
        console.log('Database seeded successfully!')
      }
    } else {
      console.log('Database already contains data, no need to seed.')
    }
    
    // Step 6: Add or ensure default job category locations
    try {
      const { addJobCategoryDefaults } = await import('../services/database');
      await addJobCategoryDefaults();
    } catch (error) {
      console.warn('Error adding job category defaults:', error);
      // Continue anyway as this is not critical
    }
    
    console.log('Application initialized successfully')
    return true
  } catch (error) {
    console.error('Error during application initialization:', error)
    return false
  }
}

/**
 * Check if data needs migration from localStorage to Supabase
 * @returns Promise<boolean> indicating if migration is needed
 */
export async function needsMigration(): Promise<boolean> {
  try {
    // First check if we have local data
    const hasLocalSettings = !!localStorage.getItem('porterTrackSettings')
    const hasLocalLocations = !!localStorage.getItem('porterTrackLocations')
    
    if (!hasLocalSettings && !hasLocalLocations) {
      // Nothing to migrate
      return false
    }
    
    // Then check if Supabase has data - this needs to query Supabase directly
    const needsMigration = await checkNeedsMigration()
    
    // If Supabase doesn't have data but localStorage does, migration is needed
    return needsMigration
  } catch (error) {
    console.error('Error checking if migration is needed:', error)
    return false
  }
}
