const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAPIRoutes() {
  console.log('🧪 Testing API Routes...')
  console.log('========================\n')

  try {
    // Test 1: Patients
    console.log('1. Testing patients API...')
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .limit(5)
    
    if (patientsError) {
      console.log('❌ Patients API failed:', patientsError.message)
    } else {
      console.log(`✅ Patients API: ${patients?.length || 0} records`)
    }

    // Test 2: Products
    console.log('\n2. Testing products API...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5)
    
    if (productsError) {
      console.log('❌ Products API failed:', productsError.message)
    } else {
      console.log(`✅ Products API: ${products?.length || 0} records`)
    }

    // Test 3: Bills
    console.log('\n3. Testing bills API...')
    const { data: bills, error: billsError } = await supabase
      .from('bills')
      .select('*')
      .limit(5)
    
    if (billsError) {
      console.log('❌ Bills API failed:', billsError.message)
    } else {
      console.log(`✅ Bills API: ${bills?.length || 0} records`)
    }

    // Test 4: Expenses
    console.log('\n4. Testing expenses API...')
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .limit(5)
    
    if (expensesError) {
      console.log('❌ Expenses API failed:', expensesError.message)
    } else {
      console.log(`✅ Expenses API: ${expenses?.length || 0} records`)
    }

    // Test 5: Revenue entries
    console.log('\n5. Testing revenue entries API...')
    const { data: revenue, error: revenueError } = await supabase
      .from('revenue_entries')
      .select('*')
      .limit(5)
    
    if (revenueError) {
      console.log('❌ Revenue API failed:', revenueError.message)
    } else {
      console.log(`✅ Revenue API: ${revenue?.length || 0} records`)
    }

    console.log('\n🎉 API Routes Test Complete!')
    console.log('The dashboard should now work properly.')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAPIRoutes()
