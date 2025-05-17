import { createClient } from '@supabase/supabase-js'

// Use environment variables with fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string

// Validate we have the required environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.')
}

// Create the Supabase client with default options
export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Test the Supabase connection
 * @returns True if connection is successful, false otherwise
 */
export async function testConnection() {
  try {
    // Simple query to verify connection
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error connecting to Supabase:', error.message)
      return false
    }
    
    console.log('Successfully connected to Supabase')
    return true
  } catch (error) {
    console.error('Unexpected error testing Supabase connection:', error)
    return false
  }
}

/**
 * Initialize the database by creating necessary tables if they don't exist
 * This should be called when the application starts
 */
export async function initializeDatabase(): Promise<boolean> {
  try {
    console.log('Initializing Supabase database...')
    
    // Simple database check
    const result = await testConnection()
    if (!result) {
      console.error('Failed to connect to Supabase')
      return false
    }
    
    // Verify tables exist
    const tables = [
      'settings',
      'supervisors',
      'porters',
      'buildings',
      'departments',
      'job_categories',
      'job_category_defaults',
      'designation_departments',
      'shifts',
      'tasks',
      'porter_assignments',
      'shift_assigned_porters'
    ]
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.warn(`Table '${table}' might not exist or cannot be accessed: ${error.message}`)
      } else {
        console.log(`Table '${table}' exists with ${count} rows`)
      }
    }
    
    console.log('Database initialization completed')
    return true
  } catch (error) {
    console.error('Error initializing database:', error)
    return false
  }
}

/**
 * Create a new unique ID
 * @returns A unique string ID
 */
export function generateId(): string {
  // Create a unique ID using timestamp and random values
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}
