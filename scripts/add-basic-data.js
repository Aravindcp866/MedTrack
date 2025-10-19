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

async function addBasicData() {
  console.log('📊 Adding Basic Test Data...')
  console.log('===========================\n')

  try {
    // Add some basic treatments
    console.log('💊 Adding treatments...')
    const { data: treatments, error: tError } = await supabase
      .from('treatments')
      .insert([
        { name: 'Consultation', price_cents: 50000 },
        { name: 'Blood Test', price_cents: 80000 },
        { name: 'X-Ray', price_cents: 120000 }
      ])
      .select()

    if (tError) {
      console.error('❌ Error adding treatments:', tError.message)
      return
    }

    console.log(`✅ Added ${treatments.length} treatments`)

    // Add some basic products
    console.log('📦 Adding products...')
    const { data: products, error: pError } = await supabase
      .from('products')
      .insert([
        { name: 'Bandages', unit_price: 2.50, stock_quantity: 100 },
        { name: 'Thermometer', unit_price: 15.00, stock_quantity: 20 }
      ])
      .select()

    if (pError) {
      console.error('❌ Error adding products:', pError.message)
      return
    }

    console.log(`✅ Added ${products.length} products`)

    // Add some basic patients
    console.log('👥 Adding patients...')
    const { data: patients, error: patError } = await supabase
      .from('patients')
      .insert([
        {
          first_name: 'John',
          last_name: 'Doe',
          phone: '1234567890',
          email: 'john@example.com'
        },
        {
          first_name: 'Jane',
          last_name: 'Smith',
          phone: '0987654321',
          email: 'jane@example.com'
        }
      ])
      .select()

    if (patError) {
      console.error('❌ Error adding patients:', patError.message)
      return
    }

    console.log(`✅ Added ${patients.length} patients`)

    // Add some basic visits
    console.log('📋 Adding visits...')
    for (const patient of patients) {
      const { data: visit, error: vError } = await supabase
        .from('visits')
        .insert({
          patient_id: patient.id,
          visit_date: new Date().toISOString().split('T')[0],
          visit_type: 'consultation',
          status: 'completed'
        })
        .select()
        .single()

      if (vError) {
        console.error(`❌ Error adding visit for ${patient.first_name}:`, vError.message)
        continue
      }

      console.log(`  ✅ Added visit for ${patient.first_name}`)
    }

    // Add some basic expenses
    console.log('💸 Adding expenses...')
    const { data: expenses, error: eError } = await supabase
      .from('expenses')
      .insert([
        { description: 'Office Rent', amount: 1000.00, category: 'Rent', expense_date: new Date().toISOString().split('T')[0] },
        { description: 'Medical Supplies', amount: 500.00, category: 'Supplies', expense_date: new Date().toISOString().split('T')[0] }
      ])
      .select()

    if (eError) {
      console.error('❌ Error adding expenses:', eError.message)
      return
    }

    console.log(`✅ Added ${expenses.length} expenses`)

    console.log('\n🎉 Basic data added successfully!')
    console.log('===============================')
    console.log('✅ Core data structure created')
    console.log('✅ Ready for testing basic functionality')

  } catch (error) {
    console.error('❌ Error during data addition:', error.message)
  }
}

addBasicData()
