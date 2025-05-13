import { initializeSupabase, ensureTablesExist } from './supabase'
import { initializeDatabase, seedDatabase } from '../services/database'

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
    
    // Step 4: Seed the database if empty
    const dbSeeded = await seedDatabase()
    if (!dbSeeded) {
      console.warn('Database seeding may have failed. App will use fallback data sources.')
      // Continue anyway as we have fallbacks to localStorage and JSON files
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
    
    // Then check if Supabase has data
    const { data, error, count } = await fetch('/data/settings.json')
      .then(res => res.json())
      .catch(() => ({ count: 0 }))
    
    if (error) {
      console.error('Error checking if migration is needed:', error)
      return false
    }
    
    // If Supabase doesn't have data but localStorage does, migration is needed
    return count === 0
  } catch (error) {
    console.error('Error checking if migration is needed:', error)
    return false
  }
}
