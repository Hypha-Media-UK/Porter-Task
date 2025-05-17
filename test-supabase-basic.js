import { createClient } from '@supabase/supabase-js'

// Use the credentials from the task requirements
const supabaseUrl = 'https://scyavdsrkqopnucwmqui.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjeWF2ZHNya3FvcG51Y3dtcXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODU2MjMsImV4cCI6MjA2MzA2MTYyM30.cLys3-wskwTGnQ3k_aEt_vm8DxxaTX6LWOclgoB-DEA'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

async function testBasicConnection() {
  console.log('🔄 Testing basic Supabase connection...')
  console.log(`URL: ${supabaseUrl}`)
  
  try {
    // Try the simplest possible query - get auth config, which should be available
    // even without any configured tables
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Error connecting to Supabase:', error)
      return false
    }
    
    console.log('✅ Successfully connected to Supabase!')
    console.log('Session data:', data)
    
    // Try to create a simple bucket - this would validate write permissions
    console.log('\n🔄 Testing storage functionality...')
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .listBuckets()
    
    if (bucketError) {
      console.log('❌ Could not access storage buckets:', bucketError.message)
    } else {
      console.log('✅ Successfully accessed storage buckets!')
      console.log('Available buckets:', bucketData)
    }
    
    // Try listing all tables in the database
    console.log('\n🔄 Testing database access...')
    const result = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    if (result.ok) {
      const tablesList = await result.json()
      console.log('✅ Successfully accessed database API!')
      console.log('Available endpoints:', tablesList)
    } else {
      console.log('❌ Could not access database API:', await result.text())
    }
    
    return true
  } catch (error) {
    console.error('❌ Unexpected error testing Supabase connection:', error)
    return false
  }
}

// Run the test
testBasicConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ Supabase basic connection test passed')
    } else {
      console.log('\n❌ Supabase basic connection test failed')
      console.log('Please verify that the Supabase URL and API key are correct.')
    }
  })
  .catch(err => {
    console.error('Error running test:', err)
  })
