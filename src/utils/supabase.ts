import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://qhetbddcmbljmirrkaac.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoZXRiZGRjbWJsam1pcnJrYWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzQ2MzYsImV4cCI6MjA2MjcxMDYzNn0.R1xJDIQHl8G-t4uYDH8pDwlLd7pJCwqtWMvplaJxUmA'

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Initialize Supabase and verify that the user is authenticated
 * or the anonymous access works
 */
export async function initializeSupabase() {
  try {
    // Simple check if Supabase is accessible by requesting the PostgreSQL version
    const { data, error } = await supabase.rpc('get_pg_version')
    
    if (error) {
      console.error('Error connecting to Supabase:', error)
      return false
    }
    
    console.log('Supabase connection established. PostgreSQL version:', data)
    return true
  } catch (error) {
    console.error('Error initializing Supabase:', error)
    return false
  }
}

/**
 * Check if Supabase tables exist and create them if they don't
 */
export async function ensureTablesExist() {
  const tables = [
    'shifts',
    'tasks',
    'porter_assignments',
    'shift_assigned_porters',
    'supervisors',
    'porters',
    'buildings',
    'departments',
    'job_categories',
    'job_category_defaults',
    'designation_departments',
    'settings'
  ]
  
  try {
    // Check each table
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.error(`Error checking table ${table}:`, error)
        // Table might not exist, we'll attempt to create it
        await createTable(table)
      } else {
        console.log(`Table ${table} exists, has ${count} rows`)
      }
    }
    
    return true
  } catch (error) {
    console.error('Error ensuring tables exist:', error)
    return false
  }
}

/**
 * Create a table with the appropriate schema
 */
async function createTable(tableName: string) {
  // Note: In Supabase, we should typically create tables through migrations
  // or the Supabase dashboard. This is a fallback for development purposes.
  console.warn(`Table ${tableName} doesn't exist or can't be accessed. Please create it through the Supabase dashboard.`)
  
  // If we want to support automatic table creation, we would need to implement SQL statements
  // for each table structure here. For now, we just log a warning.
  
  return false
}
