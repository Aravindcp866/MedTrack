const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Please create a .env.local file with your Supabase credentials.')
  console.error('See DATABASE_SETUP_GUIDE.md for instructions.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('patients')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      console.error('Please check your Supabase credentials and ensure the schema has been applied.')
      return false
    }
    
    console.log('✅ Database connection successful!')
    
    // Test if tables exist
    const tables = ['patients', 'products', 'bills', 'expenses', 'visits']
    
    for (const table of tables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('count')
        .limit(1)
      
      if (tableError) {
        console.error(`❌ Table '${table}' not found or not accessible`)
        return false
      } else {
        console.log(`✅ Table '${table}' is accessible`)
      }
    }
    
    console.log('🎉 All database tests passed!')
    console.log('Your database is ready to use.')
    
    return true
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
    return false
  }
}

// Run the test
testConnection().then(success => {
  process.exit(success ? 0 : 1)
})
