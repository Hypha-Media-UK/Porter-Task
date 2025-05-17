import { createClient } from '@supabase/supabase-js'

// Use the credentials provided in the requirements
const supabaseUrl = 'https://scyavdsrkqopnucwmqui.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjeWF2ZHNya3FvcG51Y3dtcXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODU2MjMsImV4cCI6MjA2MzA2MTYyM30.cLys3-wskwTGnQ3k_aEt_vm8DxxaTX6LWOclgoB-DEA'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // Try to get the PostgreSQL version (simple query that should work)
    const { data, error } = await supabase.rpc('get_pg_version')
    
    if (error) {
      console.error('Error connecting to Supabase:', error)
      return false
    }
    
    console.log('✅ Successfully connected to Supabase!')
    console.log('PostgreSQL version:', data)
    
    // Check if tables exist
    console.log('\nChecking for existing tables...')
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
    
    for (const table of tables) {
      const { count, error: tableError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (tableError) {
        console.log(`❌ Table '${table}' does not exist or cannot be accessed: ${tableError.message}`)
      } else {
        console.log(`✅ Table '${table}' exists with ${count} rows`)
      }
    }
    
    return true
  } catch (error) {
    console.error('Unexpected error testing Supabase connection:', error)
    return false
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ Supabase connection test completed successfully')
    } else {
      console.log('\n❌ Supabase connection test failed')
    }
  })
  .catch(err => {
    console.error('Error running test:', err)
  })
