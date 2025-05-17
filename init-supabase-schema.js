import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'

// Use the credentials provided in the requirements
const supabaseUrl = 'https://scyavdsrkqopnucwmqui.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjeWF2ZHNya3FvcG51Y3dtcXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODU2MjMsImV4cCI6MjA2MzA2MTYyM30.cLys3-wskwTGnQ3k_aEt_vm8DxxaTX6LWOclgoB-DEA'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

async function initializeDatabase() {
  console.log('Testing Supabase connection and initializing database schema...')
  
  try {
    // First, let's verify the connection by trying a simple query
    console.log('\nVerifying database connection...')
    
    // Try to list all available tables
    const { data: schemaData, error: schemaError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('schemaname, tablename')
      .eq('schemaname', 'public')
    
    if (schemaError) {
      console.error('Error connecting to database:', schemaError)
      console.log('Trying to run a raw SQL query instead...')
      
      // Alternative connection test
      const { data: version, error: versionError } = await supabase
        .rpc('pg_client_encoding')
      
      if (versionError) {
        console.error('Error executing fallback query:', versionError)
        return false
      } else {
        console.log('✅ Successfully connected to the database')
        console.log('Database encoding:', version)
      }
    } else {
      console.log('✅ Successfully connected to the database')
      console.log('Found tables in public schema:', schemaData)
    }
    
    // Now let's create the schema from our SQL file
    console.log('\nApplying database schema...')
    try {
      const schemaSQL = await fs.readFile('./supabase/schema.sql', 'utf8')
      
      // Split the schema into individual statements
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0)
      
      console.log(`Found ${statements.length} SQL statements to execute`)
      
      // Execute each statement
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i]
        console.log(`Executing statement ${i + 1}/${statements.length}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: stmt })
        
        if (error) {
          console.warn(`Warning executing statement ${i + 1}: ${error.message}`)
          
          // If this is a "relation already exists" error, it's okay
          if (error.message.includes('already exists')) {
            console.log('  This appears to be an "already exists" error, continuing...')
          } else {
            // For other errors, log and continue
            console.log('  Statement that caused error:', stmt.substring(0, 100) + '...')
          }
        }
      }
      
      console.log('Schema application completed')
      
    } catch (readError) {
      console.error('Error reading schema file:', readError)
      console.log('Trying alternative approach with direct SQL statements...')
      
      // If we can't read the schema file, try creating tables directly
      // We'll create just a couple of essential tables for testing
      const createTableStatements = [
        `CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS supervisors (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE
        )`,
        `CREATE TABLE IF NOT EXISTS porters (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE
        )`
      ]
      
      for (const stmt of createTableStatements) {
        const { error } = await supabase.rpc('exec_sql', { sql: stmt })
        
        if (error) {
          console.warn(`Warning executing direct statement: ${error.message}`)
          
          // If the exec_sql function doesn't exist, try another approach
          if (error.message.includes('function exec_sql') || error.message.includes('does not exist')) {
            console.log('The exec_sql function does not exist. Trying raw REST API...')
            
            // This won't work without proper setup, but we can suggest it
            console.log('Please create the database schema manually using the Supabase dashboard.')
            console.log('The schema file is available at: ./supabase/schema.sql')
            break
          }
        }
      }
    }
    
    // Verify that we can now access the tables
    console.log('\nVerifying tables were created...')
    const tablesToCheck = [
      'settings',
      'supervisors',
      'porters'
    ]
    
    let tablesFound = 0
    
    for (const table of tablesToCheck) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table '${table}' could not be accessed: ${error.message}`)
      } else {
        console.log(`✅ Table '${table}' exists and can be accessed`)
        tablesFound++
      }
    }
    
    if (tablesFound === 0) {
      console.log('\nNo tables could be accessed. The schema may not have been applied correctly.')
      console.log('You may need to create the schema manually using the Supabase dashboard.')
      return false
    } else if (tablesFound < tablesToCheck.length) {
      console.log(`\nOnly ${tablesFound} out of ${tablesToCheck.length} tables could be accessed.`)
      console.log('Some tables may not have been created properly.')
    } else {
      console.log('\n✅ All tables were created and can be accessed!')
    }
    
    return true
  } catch (error) {
    console.error('Unexpected error initializing database:', error)
    return false
  }
}

// Run the initialization
initializeDatabase()
  .then(success => {
    if (success) {
      console.log('\n✅ Database initialization completed successfully')
    } else {
      console.log('\n❌ Database initialization failed')
    }
  })
  .catch(err => {
    console.error('Error running initialization:', err)
  })
