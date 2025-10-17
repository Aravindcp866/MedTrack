const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addDummyData() {
  console.log('🚀 Adding comprehensive dummy data...')

  try {
    // 1. Add more patients
    console.log('📝 Adding patients...')
    const patients = [
      {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0101',
        date_of_birth: '1985-03-15',
        gender: 'Male',
        address: '123 Main St, New York, NY 10001',
        medical_history: 'Hypertension, Diabetes Type 2',
        allergies: 'Penicillin, Shellfish',
        emergency_contact_name: 'Jane Smith',
        emergency_contact_phone: '+1-555-0102'
      },
      {
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0201',
        date_of_birth: '1990-07-22',
        gender: 'Female',
        address: '456 Oak Ave, Los Angeles, CA 90210',
        medical_history: 'Asthma, Seasonal allergies',
        allergies: 'Dust mites, Pollen',
        emergency_contact_name: 'Mike Johnson',
        emergency_contact_phone: '+1-555-0202'
      },
      {
        first_name: 'Michael',
        last_name: 'Brown',
        email: 'michael.brown@email.com',
        phone: '+1-555-0301',
        date_of_birth: '1978-11-08',
        gender: 'Male',
        address: '789 Pine St, Chicago, IL 60601',
        medical_history: 'High cholesterol, Back pain',
        allergies: 'None known',
        emergency_contact_name: 'Lisa Brown',
        emergency_contact_phone: '+1-555-0302'
      },
      {
        first_name: 'Emily',
        last_name: 'Davis',
        email: 'emily.davis@email.com',
        phone: '+1-555-0401',
        date_of_birth: '1992-05-14',
        gender: 'Female',
        address: '321 Elm St, Houston, TX 77001',
        medical_history: 'Migraine, Anxiety',
        allergies: 'Latex',
        emergency_contact_name: 'David Davis',
        emergency_contact_phone: '+1-555-0402'
      },
      {
        first_name: 'Robert',
        last_name: 'Wilson',
        email: 'robert.wilson@email.com',
        phone: '+1-555-0501',
        date_of_birth: '1983-09-30',
        gender: 'Male',
        address: '654 Maple Dr, Phoenix, AZ 85001',
        medical_history: 'Heart condition, Sleep apnea',
        allergies: 'Aspirin',
        emergency_contact_name: 'Mary Wilson',
        emergency_contact_phone: '+1-555-0502'
      }
    ]

    const { data: patientsData, error: patientsError } = await supabase
      .from('patients')
      .insert(patients)
      .select()

    if (patientsError) {
      console.log('Patients already exist or error:', patientsError.message)
    } else {
      console.log(`✅ Added ${patientsData.length} patients`)
    }

    // 2. Add more products with quantities
    console.log('📦 Adding products with quantities...')
    const products = [
      {
        name: 'Paracetamol 500mg',
        description: 'Pain relief tablets',
        sku: 'MED-001',
        category: 'Medication',
        unit_price_cents: 500, // $5.00
        current_stock: 150,
        min_stock_level: 20
      },
      {
        name: 'Ibuprofen 400mg',
        description: 'Anti-inflammatory tablets',
        sku: 'MED-002',
        category: 'Medication',
        unit_price_cents: 750, // $7.50
        current_stock: 200,
        min_stock_level: 30
      },
      {
        name: 'Bandages (Pack of 50)',
        description: 'Sterile adhesive bandages',
        sku: 'SUP-001',
        category: 'Supplies',
        unit_price_cents: 1200, // $12.00
        current_stock: 75,
        min_stock_level: 15
      },
      {
        name: 'Surgical Gloves (Box of 100)',
        description: 'Latex-free surgical gloves',
        sku: 'SUP-002',
        category: 'Supplies',
        unit_price_cents: 2500, // $25.00
        current_stock: 40,
        min_stock_level: 10
      },
      {
        name: 'Thermometer Digital',
        description: 'Digital medical thermometer',
        sku: 'EQU-001',
        category: 'Equipment',
        unit_price_cents: 3500, // $35.00
        current_stock: 25,
        min_stock_level: 5
      },
      {
        name: 'Blood Pressure Monitor',
        description: 'Digital blood pressure monitor',
        sku: 'EQU-002',
        category: 'Equipment',
        unit_price_cents: 15000, // $150.00
        current_stock: 8,
        min_stock_level: 3
      },
      {
        name: 'Syringes 5ml (Pack of 100)',
        description: 'Sterile disposable syringes',
        sku: 'SUP-003',
        category: 'Supplies',
        unit_price_cents: 800, // $8.00
        current_stock: 120,
        min_stock_level: 25
      },
      {
        name: 'Antiseptic Solution',
        description: 'Chlorhexidine antiseptic solution',
        sku: 'MED-003',
        category: 'Medication',
        unit_price_cents: 1800, // $18.00
        current_stock: 60,
        min_stock_level: 12
      }
    ]

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .insert(products)
      .select()

    if (productsError) {
      console.log('Products already exist or error:', productsError.message)
    } else {
      console.log(`✅ Added ${productsData.length} products`)
    }

    // 3. Add more expenses with different categories
    console.log('💰 Adding expenses...')
    const expenses = [
      {
        description: 'Office rent for January',
        amount: 250000, // $2,500.00
        category: 'rent',
        expense_date: '2024-01-01'
      },
      {
        description: 'Electricity bill',
        amount: 35000, // $350.00
        category: 'utilities',
        expense_date: '2024-01-15'
      },
      {
        description: 'Nurse salary',
        amount: 450000, // $4,500.00
        category: 'staff',
        expense_date: '2024-01-31'
      },
      {
        description: 'New medical equipment',
        amount: 150000, // $1,500.00
        category: 'equipment',
        expense_date: '2024-02-05'
      },
      {
        description: 'Medical supplies restock',
        amount: 85000, // $850.00
        category: 'supplies',
        expense_date: '2024-02-10'
      },
      {
        description: 'Insurance premium',
        amount: 120000, // $1,200.00
        category: 'insurance',
        expense_date: '2024-02-15'
      },
      {
        description: 'Online advertising',
        amount: 25000, // $250.00
        category: 'marketing',
        expense_date: '2024-02-20'
      },
      {
        description: 'Equipment maintenance',
        amount: 40000, // $400.00
        category: 'maintenance',
        expense_date: '2024-02-25'
      }
    ]

    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .insert(expenses)
      .select()

    if (expensesError) {
      console.log('Expenses already exist or error:', expensesError.message)
    } else {
      console.log(`✅ Added ${expensesData.length} expenses`)
    }

    // 4. Add revenue entries
    console.log('💵 Adding revenue entries...')
    const revenueEntries = [
      {
        description: 'Consultation fees',
        amount: 50000, // $500.00
        revenue_date: '2024-01-15'
      },
      {
        description: 'Lab tests',
        amount: 25000, // $250.00
        revenue_date: '2024-01-20'
      },
      {
        description: 'Medication sales',
        amount: 15000, // $150.00
        revenue_date: '2024-01-25'
      },
      {
        description: 'Consultation fees',
        amount: 75000, // $750.00
        revenue_date: '2024-02-01'
      },
      {
        description: 'Emergency services',
        amount: 100000, // $1,000.00
        revenue_date: '2024-02-05'
      },
      {
        description: 'Follow-up consultations',
        amount: 30000, // $300.00
        revenue_date: '2024-02-10'
      },
      {
        description: 'Lab tests',
        amount: 40000, // $400.00
        revenue_date: '2024-02-15'
      },
      {
        description: 'Medication sales',
        amount: 20000, // $200.00
        revenue_date: '2024-02-20'
      }
    ]

    const { data: revenueData, error: revenueError } = await supabase
      .from('revenue_entries')
      .insert(revenueEntries)
      .select()

    if (revenueError) {
      console.log('Revenue entries already exist or error:', revenueError.message)
    } else {
      console.log(`✅ Added ${revenueData.length} revenue entries`)
    }

    // 5. Add visits
    console.log('🏥 Adding visits...')
    const visits = [
      {
        patient_id: patientsData?.[0]?.id || 'existing-patient-id',
        visit_type: 'Consultation',
        status: 'completed',
        notes: 'Regular checkup, patient in good health',
        visit_date: '2024-01-15'
      },
      {
        patient_id: patientsData?.[1]?.id || 'existing-patient-id',
        visit_type: 'Follow-up',
        status: 'completed',
        notes: 'Follow-up for asthma treatment',
        visit_date: '2024-01-20'
      },
      {
        patient_id: patientsData?.[2]?.id || 'existing-patient-id',
        visit_type: 'Emergency',
        status: 'completed',
        notes: 'Emergency visit for back pain',
        visit_date: '2024-02-01'
      },
      {
        patient_id: patientsData?.[3]?.id || 'existing-patient-id',
        visit_type: 'Consultation',
        status: 'completed',
        notes: 'Migraine consultation and treatment',
        visit_date: '2024-02-05'
      },
      {
        patient_id: patientsData?.[4]?.id || 'existing-patient-id',
        visit_type: 'Checkup',
        status: 'completed',
        notes: 'Cardiac checkup and monitoring',
        visit_date: '2024-02-10'
      }
    ]

    const { data: visitsData, error: visitsError } = await supabase
      .from('visits')
      .insert(visits)
      .select()

    if (visitsError) {
      console.log('Visits already exist or error:', visitsError.message)
    } else {
      console.log(`✅ Added ${visitsData.length} visits`)
    }

    // 6. Add bills
    console.log('🧾 Adding bills...')
    const bills = [
      {
        patient_id: patientsData?.[0]?.id || 'existing-patient-id',
        bill_number: 'INV-001',
        total_cents: 50000, // $500.00
        payment_status: 'paid',
        payment_method: 'cash',
        due_date: '2024-01-30'
      },
      {
        patient_id: patientsData?.[1]?.id || 'existing-patient-id',
        bill_number: 'INV-002',
        total_cents: 25000, // $250.00
        payment_status: 'pending',
        payment_method: null,
        due_date: '2024-02-15'
      },
      {
        patient_id: patientsData?.[2]?.id || 'existing-patient-id',
        bill_number: 'INV-003',
        total_cents: 75000, // $750.00
        payment_status: 'paid',
        payment_method: 'card',
        due_date: '2024-02-10'
      },
      {
        patient_id: patientsData?.[3]?.id || 'existing-patient-id',
        bill_number: 'INV-004',
        total_cents: 30000, // $300.00
        payment_status: 'overdue',
        payment_method: null,
        due_date: '2024-01-25'
      },
      {
        patient_id: patientsData?.[4]?.id || 'existing-patient-id',
        bill_number: 'INV-005',
        total_cents: 100000, // $1,000.00
        payment_status: 'paid',
        payment_method: 'insurance',
        due_date: '2024-02-20'
      }
    ]

    const { data: billsData, error: billsError } = await supabase
      .from('bills')
      .insert(bills)
      .select()

    if (billsError) {
      console.log('Bills already exist or error:', billsError.message)
    } else {
      console.log(`✅ Added ${billsData.length} bills`)
    }

    console.log('🎉 All dummy data added successfully!')
    console.log('\n📊 Summary:')
    console.log(`- Patients: ${patients.length}`)
    console.log(`- Products: ${products.length} (with quantities)`)
    console.log(`- Expenses: ${expenses.length} (across different categories)`)
    console.log(`- Revenue Entries: ${revenueEntries.length}`)
    console.log(`- Visits: ${visits.length}`)
    console.log(`- Bills: ${bills.length}`)

  } catch (error) {
    console.error('❌ Error adding dummy data:', error)
  }
}

addDummyData()
