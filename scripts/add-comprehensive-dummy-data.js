const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to generate random dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper function to generate random amount in cents
function randomAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min) * 100
}

async function addDummyData() {
  console.log('🚀 Adding comprehensive dummy data...')

  try {
    // 1. Add more patients with detailed information
    console.log('📝 Adding patients...')
    const patients = [
      {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0101',
        date_of_birth: '1985-03-15',
        gender: 'male',
        address: '123 Main St, New York, NY 10001',
        emergency_contact_name: 'Jane Smith',
        emergency_contact_phone: '+1-555-0102',
        medical_history: 'Hypertension, Diabetes Type 2',
        allergies: 'Penicillin, Shellfish'
      },
      {
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0201',
        date_of_birth: '1990-07-22',
        gender: 'female',
        address: '456 Oak Ave, Los Angeles, CA 90210',
        emergency_contact_name: 'Mike Johnson',
        emergency_contact_phone: '+1-555-0202',
        medical_history: 'Asthma, Seasonal allergies',
        allergies: 'Pollen, Dust mites'
      },
      {
        first_name: 'Michael',
        last_name: 'Brown',
        email: 'michael.brown@email.com',
        phone: '+1-555-0301',
        date_of_birth: '1978-11-08',
        gender: 'male',
        address: '789 Pine St, Chicago, IL 60601',
        emergency_contact_name: 'Lisa Brown',
        emergency_contact_phone: '+1-555-0302',
        medical_history: 'High cholesterol, Sleep apnea',
        allergies: 'None known'
      },
      {
        first_name: 'Emily',
        last_name: 'Davis',
        email: 'emily.davis@email.com',
        phone: '+1-555-0401',
        date_of_birth: '1992-05-14',
        gender: 'female',
        address: '321 Elm St, Houston, TX 77001',
        emergency_contact_name: 'David Davis',
        emergency_contact_phone: '+1-555-0402',
        medical_history: 'Migraine, Anxiety',
        allergies: 'Latex, Ibuprofen'
      },
      {
        first_name: 'Robert',
        last_name: 'Wilson',
        email: 'robert.wilson@email.com',
        phone: '+1-555-0501',
        date_of_birth: '1983-09-30',
        gender: 'male',
        address: '654 Maple Dr, Phoenix, AZ 85001',
        emergency_contact_name: 'Mary Wilson',
        emergency_contact_phone: '+1-555-0502',
        medical_history: 'Arthritis, GERD',
        allergies: 'Sulfa drugs'
      }
    ]

    const { data: insertedPatients, error: patientsError } = await supabase
      .from('patients')
      .insert(patients)
      .select()

    if (patientsError) throw patientsError
    console.log(`✅ Added ${insertedPatients.length} patients`)

    // 2. Add more products with realistic quantities
    console.log('📦 Adding products...')
    const products = [
      {
        name: 'Blood Pressure Monitor',
        description: 'Digital blood pressure monitor with large display',
        category: 'Medical Equipment',
        unit_price: 89.99,
        stock_quantity: 15,
        min_stock_level: 5,
        unit: 'piece'
      },
      {
        name: 'Glucose Test Strips',
        description: 'Box of 50 glucose test strips',
        category: 'Diagnostic Supplies',
        unit_price: 24.99,
        stock_quantity: 200,
        min_stock_level: 50,
        unit: 'box'
      },
      {
        name: 'Surgical Gloves (Box of 100)',
        description: 'Latex-free surgical gloves, powder-free',
        category: 'Personal Protective Equipment',
        unit_price: 12.99,
        stock_quantity: 50,
        min_stock_level: 10,
        unit: 'box'
      },
      {
        name: 'Thermometer Digital',
        description: 'Digital oral/rectal thermometer',
        category: 'Medical Equipment',
        unit_price: 15.99,
        stock_quantity: 25,
        min_stock_level: 8,
        unit: 'piece'
      },
      {
        name: 'Bandages (Assorted)',
        description: 'Box of assorted adhesive bandages',
        category: 'First Aid',
        unit_price: 8.99,
        stock_quantity: 100,
        min_stock_level: 20,
        unit: 'box'
      }
    ]

    const { data: insertedProducts, error: productsError } = await supabase
      .from('products')
      .insert(products)
      .select()

    if (productsError) throw productsError
    console.log(`✅ Added ${insertedProducts.length} products`)

    // 3. Add comprehensive expenses data
    console.log('💰 Adding expenses...')
    const expenseCategories = ['Rent', 'Utilities', 'Medical Supplies', 'Equipment', 'Staff Salaries', 'Insurance', 'Marketing', 'Maintenance']
    const expenses = []

    // Generate expenses for the last 6 months
    for (let month = 0; month < 6; month++) {
      const date = new Date()
      date.setMonth(date.getMonth() - month)
      
      // Add 3-5 expenses per month
      const numExpenses = Math.floor(Math.random() * 3) + 3
      
      for (let i = 0; i < numExpenses; i++) {
        const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
        const amount = randomAmount(50, 2000) // $50 to $2000
        
        expenses.push({
          description: `${category} expense for ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          amount: amount,
          category: category,
          expense_date: randomDate(
            new Date(date.getFullYear(), date.getMonth(), 1),
            new Date(date.getFullYear(), date.getMonth() + 1, 0)
          ).toISOString().split('T')[0]
        })
      }
    }

    const { data: insertedExpenses, error: expensesError } = await supabase
      .from('expenses')
      .insert(expenses)
      .select()

    if (expensesError) throw expensesError
    console.log(`✅ Added ${insertedExpenses.length} expenses`)

    // 4. Add comprehensive revenue entries
    console.log('📈 Adding revenue entries...')
    const revenueEntries = []

    // Generate revenue for the last 6 months
    for (let month = 0; month < 6; month++) {
      const date = new Date()
      date.setMonth(date.getMonth() - month)
      
      // Add 10-20 revenue entries per month
      const numEntries = Math.floor(Math.random() * 11) + 10
      
      for (let i = 0; i < numEntries; i++) {
        const amount = randomAmount(100, 5000) // $100 to $5000
        const source = ['Consultation', 'Treatment', 'Procedure', 'Medication', 'Lab Test'][Math.floor(Math.random() * 5)]
        
        revenueEntries.push({
          amount: amount,
          source: source,
          description: `${source} revenue - ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          revenue_date: randomDate(
            new Date(date.getFullYear(), date.getMonth(), 1),
            new Date(date.getFullYear(), date.getMonth() + 1, 0)
          ).toISOString().split('T')[0]
        })
      }
    }

    const { data: insertedRevenue, error: revenueError } = await supabase
      .from('revenue_entries')
      .insert(revenueEntries)
      .select()

    if (revenueError) throw revenueError
    console.log(`✅ Added ${insertedRevenue.length} revenue entries`)

    // 5. Add visits for patients
    console.log('🏥 Adding visits...')
    const visits = []
    
    for (const patient of insertedPatients) {
      // Add 2-5 visits per patient
      const numVisits = Math.floor(Math.random() * 4) + 2
      
      for (let i = 0; i < numVisits; i++) {
        const visitDate = randomDate(
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
          new Date()
        )
        
        visits.push({
          patient_id: patient.id,
          visit_type: ['Consultation', 'Follow-up', 'Emergency', 'Routine Check-up'][Math.floor(Math.random() * 4)],
          status: ['completed', 'scheduled', 'cancelled'][Math.floor(Math.random() * 3)],
          treatment_notes: `Visit notes for ${patient.first_name} ${patient.last_name}`,
          visit_date: visitDate.toISOString().split('T')[0]
        })
      }
    }

    const { data: insertedVisits, error: visitsError } = await supabase
      .from('visits')
      .insert(visits)
      .select()

    if (visitsError) throw visitsError
    console.log(`✅ Added ${insertedVisits.length} visits`)

    // 6. Add bills for completed visits
    console.log('🧾 Adding bills...')
    const bills = []
    
    for (const visit of insertedVisits.filter(v => v.status === 'completed')) {
      const subtotal = randomAmount(100, 2000)
      const tax = Math.round(subtotal * 0.1) // 10% tax
      const total = subtotal + tax
      
      bills.push({
        visit_id: visit.id,
        bill_number: `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        subtotal: subtotal / 100,
        tax_amount: tax / 100,
        total_amount: total / 100,
        status: ['paid', 'pending', 'overdue'][Math.floor(Math.random() * 3)]
      })
    }

    const { data: insertedBills, error: billsError } = await supabase
      .from('bills')
      .insert(bills)
      .select()

    if (billsError) throw billsError
    console.log(`✅ Added ${insertedBills.length} bills`)

    console.log('🎉 All dummy data added successfully!')
    console.log('\n📊 Summary:')
    console.log(`- Patients: ${insertedPatients.length}`)
    console.log(`- Products: ${insertedProducts.length}`)
    console.log(`- Expenses: ${insertedExpenses.length}`)
    console.log(`- Revenue Entries: ${insertedRevenue.length}`)
    console.log(`- Visits: ${insertedVisits.length}`)
    console.log(`- Bills: ${insertedBills.length}`)

  } catch (error) {
    console.error('❌ Error adding dummy data:', error)
    process.exit(1)
  }
}

// Run the script
addDummyData()