const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') })

console.log('🔍 Debugging Database Connection...')
console.log('=====================================\n')

// Check environment variables
console.log('📋 Environment Variables:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing')
console.log('')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables!')
  console.error('Please check your .env.local file has:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔗 Supabase URL:', supabaseUrl)
console.log('🔑 Service Key:', supabaseServiceKey.substring(0, 20) + '...')
console.log('')

// Test Supabase connection
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugConnection() {
  try {
    console.log('🧪 Testing basic connection...')
    
    // Test 1: Basic connection
    const { data: testData, error: testError } = await supabase
      .from('patients')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Basic connection failed:', testError.message)
      console.error('Error code:', testError.code)
      console.error('Error details:', testError.details)
      console.error('Error hint:', testError.hint)
      
      if (testError.message.includes('relation "patients" does not exist')) {
        console.log('\n💡 Solution: The database schema needs to be applied!')
        console.log('Run: node scripts/apply-schema.js')
      } else if (testError.message.includes('JWT')) {
        console.log('\n💡 Solution: Check your SUPABASE_SERVICE_ROLE_KEY')
      } else if (testError.message.includes('Invalid API key')) {
        console.log('\n💡 Solution: Check your Supabase URL and Service Key')
      }
      
      return false
    }
    
    console.log('✅ Basic connection successful!')
    
    // Test 2: Check if tables exist
    console.log('\n📊 Checking database tables...')
    const tables = ['patients', 'products', 'bills', 'expenses', 'visits', 'revenue_entries']
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (tableError) {
          console.log(`❌ Table '${table}': ${tableError.message}`)
        } else {
          console.log(`✅ Table '${table}': OK`)
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`)
      }
    }
    
    // Test 3: Check if we can fetch data
    console.log('\n📈 Testing data fetching...')
    
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .limit(5)
    
    if (patientsError) {
      console.log('❌ Patients fetch failed:', patientsError.message)
    } else {
      console.log(`✅ Patients: ${patients?.length || 0} records found`)
    }
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5)
    
    if (productsError) {
      console.log('❌ Products fetch failed:', productsError.message)
    } else {
      console.log(`✅ Products: ${products?.length || 0} records found`)
    }
    
    console.log('\n🎉 Database connection is working!')
    console.log('The dashboard should now work properly.')
    
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

// Run the debug
debugConnection().then(success => {
  if (!success) {
    console.log('\n🔧 Next steps:')
    console.log('1. Check your .env.local file has correct Supabase credentials')
    console.log('2. Run: node scripts/apply-schema.js')
    console.log('3. Run: node scripts/test-connection.js')
  }
  process.exit(success ? 0 : 1)
})
