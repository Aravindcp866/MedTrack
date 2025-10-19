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

async function simplePopulate() {
  console.log('🏥 Simple Database Population...')
  console.log('===============================\n')

  try {
    // Step 1: Delete existing data
    console.log('🗑️  Clearing existing data...')
    await supabase.from('bill_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('bills').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('visit_treatments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('visits').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('patients').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('treatments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('✅ Data cleared\n')

    // Step 2: Add treatments
    console.log('💊 Adding treatments...')
    const treatments = [
      { name: 'General Consultation', price_cents: 50000 },
      { name: 'Blood Test', price_cents: 80000 },
      { name: 'ECG', price_cents: 100000 },
      { name: 'Blood Pressure Check', price_cents: 20000 },
    ]

    const { data: treatmentsData, error: treatmentsError } = await supabase
      .from('treatments')
      .insert(treatments)
      .select()

    if (treatmentsError) {
      console.error('❌ Error adding treatments:', treatmentsError.message)
      return
    }

    console.log(`✅ Added ${treatmentsData.length} treatments\n`)

    // Step 3: Add products
    console.log('📦 Adding products...')
    const products = [
      { name: 'Paracetamol', unit_price: 5.50, stock_quantity: 100 },
      { name: 'Bandages', unit_price: 2.00, stock_quantity: 50 },
    ]

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .insert(products)
      .select()

    if (productsError) {
      console.error('❌ Error adding products:', productsError.message)
      return
    }

    console.log(`✅ Added ${productsData.length} products\n`)

    // Step 4: Add patients
    console.log('👥 Adding patients...')
    const patients = [
      { first_name: 'John', last_name: 'Doe', phone: '1234567890' },
      { first_name: 'Jane', last_name: 'Smith', phone: '0987654321' },
    ]

    const { data: patientsData, error: patientsError } = await supabase
      .from('patients')
      .insert(patients)
      .select()

    if (patientsError) {
      console.error('❌ Error adding patients:', patientsError.message)
      return
    }

    console.log(`✅ Added ${patientsData.length} patients\n`)

    // Step 5: Add visits
    console.log('📋 Adding visits...')

    for (let i = 0; i < patientsData.length; i++) {
      const patient = patientsData[i]

      // Create a simple visit
      const { data: visit, error: visitError } = await supabase
        .from('visits')
        .insert({
          patient_id: patient.id,
          visit_date: new Date().toISOString().split('T')[0],
          visit_type: 'consultation',
          status: 'completed'
        })
        .select()
        .single()

      if (visitError) {
        console.error(`❌ Error creating visit for ${patient.first_name}:`, visitError.message)
        continue
      }

      console.log(`  ✅ Added visit for ${patient.first_name}`)

      // Add a treatment to the visit (if we can get the treatment ID)
      if (treatmentsData.length > 0) {
        try {
          const { error: vtError } = await supabase
            .from('visit_treatments')
            .insert({
              visit_id: visit.id,
              treatment_id: treatmentsData[0].id,
              quantity: 1,
              unit_price_cents: Math.round(treatmentsData[0].price_cents),
              total_cents: Math.round(treatmentsData[0].price_cents)
            })

          if (vtError) {
            console.error(`  ❌ Error adding treatment:`, vtError.message)
          } else {
            console.log(`    💊 Added treatment: ${treatmentsData[0].name}`)
          }
        } catch (err) {
          console.error(`  ❌ Error with treatment:`, err.message)
        }
      }
    }

    // Step 6: Add bills
    console.log('\n💰 Adding bills...')

    // Get all visits
    const { data: visits } = await supabase
      .from('visits')
      .select('*')

    for (const visit of visits || []) {
      // Calculate simple bill
      const subtotal = 75000 // ₹750
      const tax = Math.round(subtotal * 0.1) // 10% tax
      const total = subtotal + tax

      // Generate simple bill number
      const billNumber = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`

      const { data: bill, error: billError } = await supabase
        .from('bills')
        .insert({
          visit_id: visit.id,
          bill_number: billNumber,
          subtotal: subtotal / 100,
          tax_amount: tax / 100,
          total_amount: total / 100,
          subtotal_cents: subtotal,
          tax_cents: tax,
          total_cents: total,
          status: 'paid'
        })
        .select()
        .single()

      if (billError) {
        console.error(`❌ Error creating bill:`, billError.message)
      } else {
        console.log(`  💰 Created bill: ₹${(total / 100).toFixed(2)}`)
      }
    }

    // Step 7: Add expenses
    console.log('\n💸 Adding expenses...')

    const expenses = [
      { description: 'Rent', amount: 500.00, amount_cents: 50000, category: 'Rent', expense_date: new Date().toISOString().split('T')[0] },
      { description: 'Supplies', amount: 250.00, amount_cents: 25000, category: 'Supplies', expense_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { description: 'Salaries', amount: 1000.00, amount_cents: 100000, category: 'Salaries', expense_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    ]

    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .insert(expenses)
      .select()

    if (expensesError) {
      console.error('❌ Error adding expenses:', expensesError.message)
    } else {
      console.log(`✅ Added ${expensesData.length} expenses`)
    }

    console.log('\n🎉 Simple population complete!')
    console.log('==============================')
    console.log('✅ Basic data structure created')
    console.log('✅ Ready for testing dashboard functionality')

  } catch (error) {
    console.error('❌ Error during population:', error.message)
  }
}

simplePopulate()
