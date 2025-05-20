import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file
dotenv.config({ path: path.resolve('../.env') })

// Get Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

async function initializeDatabase() {
  console.log('🔄 Initializing Porter Task database with enhanced seed data...')
  console.log(`URL: ${supabaseUrl}`)
  
  try {
    // Test connection
    console.log('\n🔄 Testing Supabase connection...')
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Error connecting to Supabase:', error)
      process.exit(1)
    }
    
    console.log('✅ Successfully connected to Supabase!')
    
    // Apply schema
    console.log('\n🔄 Applying database schema...')
    try {
      const schemaSQL = await fs.readFile('./schema.sql', 'utf8')
      
      // We can't run the whole schema at once through the Supabase API
      // so we should run this in the Supabase dashboard SQL editor
      console.log('ℹ️  Schema SQL loaded, but must be run in the Supabase dashboard SQL editor.')
      console.log('ℹ️  Please copy the contents of the schema.sql file and run it in the Supabase dashboard.')
      
      console.log('\n🔄 Checking if tables exist...')
      // Check for a few key tables
      const tablesToCheck = ['settings', 'supervisors', 'buildings', 'departments']
      
      for (const table of tablesToCheck) {
        const { data, error } = await supabase.from(table).select('*').limit(1)
        
        if (error) {
          console.log(`❌ Table '${table}' might not exist: ${error.message}`)
        } else {
          console.log(`✅ Table '${table}' exists`)
        }
      }
      
      // Apply enhanced seed data
      console.log('\n🔄 Enhanced seed data is available for this application.')
      console.log('ℹ️  To use the enhanced seed data:')
      console.log('ℹ️  1. Please copy the contents of enhanced-seed.sql')
      console.log('ℹ️  2. Run it in the Supabase dashboard SQL editor')
      console.log('ℹ️  3. This will provide richer test data for the Task Management functionality')
      
    } catch (err) {
      console.error('❌ Error reading SQL files:', err)
      process.exit(1)
    }
    
    console.log('\n✅ Database initialization process completed!')
    console.log('ℹ️  Remember to run the schema.sql and enhanced-seed.sql in the Supabase dashboard SQL editor.')
    
  } catch (err) {
    console.error('❌ Unexpected error initializing database:', err)
    process.exit(1)
  }
}

// Run the initialization
initializeDatabase()
