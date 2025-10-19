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

// Real-world scenario data
const realWorldData = {
  // Medical products/services with realistic prices
  treatments: [
    { name: 'General Consultation', description: 'General medical consultation', price_cents: 50000, duration_minutes: 30 },
    { name: 'Blood Test (CBC)', description: 'Complete blood count', price_cents: 80000, duration_minutes: 15 },
    { name: 'X-Ray Chest', description: 'Chest X-ray examination', price_cents: 120000, duration_minutes: 20 },
    { name: 'ECG', description: 'Electrocardiogram', price_cents: 100000, duration_minutes: 25 },
    { name: 'Blood Pressure Check', description: 'Blood pressure monitoring', price_cents: 20000, duration_minutes: 10 },
    { name: 'Diabetes Check-up', description: 'Diabetes screening and consultation', price_cents: 150000, duration_minutes: 45 },
    { name: 'Vaccination (Flu)', description: 'Influenza vaccination', price_cents: 80000, duration_minutes: 15 },
    { name: 'Wound Dressing', description: 'Wound cleaning and dressing', price_cents: 60000, duration_minutes: 20 },
    { name: 'Physiotherapy Session', description: 'Physical therapy session', price_cents: 120000, duration_minutes: 60 },
    { name: 'Dental Check-up', description: 'Dental examination', price_cents: 80000, duration_minutes: 30 },
  ],

  // Realistic patient scenarios
  patients: [
    {
      first_name: 'Rajesh',
      last_name: 'Kumar',
      email: 'rajesh.kumar@email.com',
      phone: '+91-9876543210',
      date_of_birth: '1985-03-15',
      gender: 'male',
      address: '123 MG Road, Bangalore, Karnataka 560001',
      emergency_contact_name: 'Priya Kumar',
      emergency_contact_phone: '+91-9876543211',
      medical_history: 'Hypertension diagnosed in 2020. Taking medication regularly. No surgeries.',
      allergies: 'Penicillin - causes severe rash'
    },
    {
      first_name: 'Anita',
      last_name: 'Sharma',
      email: 'anita.sharma@email.com',
      phone: '+91-8765432109',
      date_of_birth: '1990-07-22',
      gender: 'female',
      address: '456 Residency Road, Mumbai, Maharashtra 400001',
      emergency_contact_name: 'Vikram Sharma',
      emergency_contact_phone: '+91-8765432110',
      medical_history: 'Type 2 Diabetes diagnosed in 2019. Gestational diabetes during pregnancy in 2022.',
      allergies: 'Sulfa drugs - causes allergic reaction'
    },
    {
      first_name: 'Arjun',
      last_name: 'Patel',
      email: 'arjun.patel@email.com',
      phone: '+91-7654321098',
      date_of_birth: '1978-11-08',
      gender: 'male',
      address: '789 CG Road, Ahmedabad, Gujarat 380009',
      emergency_contact_name: 'Meera Patel',
      emergency_contact_phone: '+91-7654321099',
      medical_history: 'Heart patient with bypass surgery in 2021. Regular check-ups required.',
      allergies: 'None known'
    },
    {
      first_name: 'Priya',
      last_name: 'Singh',
      email: 'priya.singh@email.com',
      phone: '+91-6543210987',
      date_of_birth: '1995-01-30',
      gender: 'female',
      address: '321 DLF Phase 1, Gurgaon, Haryana 122002',
      emergency_contact_name: 'Ravi Singh',
      emergency_contact_phone: '+91-6543210988',
      medical_history: 'Thyroid issues diagnosed in 2022. Taking medication. Regular monitoring needed.',
      allergies: 'Seafood - causes digestive issues'
    },
    {
      first_name: 'Vikram',
      last_name: 'Reddy',
      email: 'vikram.reddy@email.com',
      phone: '+91-5432109876',
      date_of_birth: '1982-09-12',
      gender: 'male',
      address: '654 Jubilee Hills, Hyderabad, Telangana 500033',
      emergency_contact_name: 'Lakshmi Reddy',
      emergency_contact_phone: '+91-5432109877',
      medical_history: 'Asthma patient since childhood. Uses inhaler regularly. Seasonal allergies.',
      allergies: 'Dust mites, pollen'
    }
  ],

  // Visit scenarios for each patient
  visitScenarios: [
    // Rajesh Kumar - Hypertension follow-up
    [
      {
        visit_type: 'follow_up',
        status: 'completed',
        treatment_notes: 'Blood pressure stable at 130/85. Continue current medication. Next follow-up in 3 months.',
        notes: null,
        visit_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
        visit_treatments: [
          { treatment_name: 'Blood Pressure Check', quantity: 1, unit_price_cents: 20000 },
          { treatment_name: 'General Consultation', quantity: 1, unit_price_cents: 50000 }
        ]
      },
      {
        visit_type: 'consultation',
        status: 'completed',
        treatment_notes: 'Initial consultation for hypertension symptoms. Prescribed medication. Diet and exercise counseling provided.',
        notes: null,
        visit_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days ago
        visit_treatments: [
          { treatment_name: 'General Consultation', quantity: 1, unit_price_cents: 50000 },
          { treatment_name: 'Blood Test (CBC)', quantity: 1, unit_price_cents: 80000 }
        ]
      }
    ],

    // Anita Sharma - Diabetes management
    [
      {
        visit_type: 'follow_up',
        status: 'completed',
        treatment_notes: 'HbA1c levels improved to 6.8%. Continue current medication and diet plan. Monthly monitoring recommended.',
        notes: null,
        visit_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days ago
        visit_treatments: [
          { treatment_name: 'Diabetes Check-up', quantity: 1, unit_price_cents: 150000 },
          { treatment_name: 'Blood Test (CBC)', quantity: 1, unit_price_cents: 80000 }
        ]
      },
      {
        visit_type: 'consultation',
        status: 'completed',
        treatment_notes: 'New patient with elevated blood sugar. Diabetes diagnosis confirmed. Started on medication and lifestyle counseling.',
        notes: null,
        visit_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days ago
        visit_treatments: [
          { treatment_name: 'General Consultation', quantity: 1, unit_price_cents: 50000 },
          { treatment_name: 'Blood Test (CBC)', quantity: 1, unit_price_cents: 80000 }
        ]
      }
    ],

    // Arjun Patel - Post-surgery cardiac care
    [
      {
        visit_type: 'follow_up',
        status: 'completed',
        treatment_notes: 'Post-bypass surgery follow-up. ECG normal. Wound healing well. Continue cardiac rehabilitation.',
        notes: null,
        visit_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
        visit_treatments: [
          { treatment_name: 'ECG', quantity: 1, unit_price_cents: 100000 },
          { treatment_name: 'General Consultation', quantity: 1, unit_price_cents: 50000 }
        ]
      },
      {
        visit_type: 'consultation',
        status: 'completed',
        treatment_notes: 'Post-operative cardiac consultation. Surgery recovery progressing well. Started cardiac rehabilitation program.',
        notes: null,
        visit_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days ago
        visit_treatments: [
          { treatment_name: 'General Consultation', quantity: 1, unit_price_cents: 50000 },
          { treatment_name: 'ECG', quantity: 1, unit_price_cents: 100000 }
        ]
      }
    ],

    // Priya Singh - Thyroid monitoring
    [
      {
        visit_type: 'follow_up',
        status: 'completed',
        treatment_notes: 'Thyroid function tests normal. TSH levels stable. Continue current medication dosage.',
        notes: null,
        visit_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 days ago
        visit_treatments: [
          { treatment_name: 'Blood Test (CBC)', quantity: 1, unit_price_cents: 80000 },
          { treatment_name: 'General Consultation', quantity: 1, unit_price_cents: 50000 }
        ]
      }
    ],

    // Vikram Reddy - Asthma management
    [
      {
        visit_type: 'consultation',
        status: 'completed',
        treatment_notes: 'Asthma flare-up due to seasonal allergies. Increased inhaler dosage. Allergy testing recommended.',
        notes: null,
        visit_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days ago
        visit_treatments: [
          { treatment_name: 'General Consultation', quantity: 1, unit_price_cents: 50000 },
          { treatment_name: 'Vaccination (Flu)', quantity: 1, unit_price_cents: 80000 }
        ]
      },
      {
        visit_type: 'follow_up',
        status: 'completed',
        treatment_notes: 'Regular asthma check-up. Lung function tests normal. Continue current inhaler regimen.',
        notes: null,
        visit_date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 40 days ago
        visit_treatments: [
          { treatment_name: 'General Consultation', quantity: 1, unit_price_cents: 50000 }
        ]
      }
    ]
  ]
}

async function addRealWorldData() {
  try {
    console.log('🏥 Adding Real-World Clinic Data...')
    console.log('==================================\n')

    // Step 1: Add treatments
    console.log('📋 Adding treatments...')
    const { data: treatments, error: treatmentsError } = await supabase
      .from('treatments')
      .insert(realWorldData.treatments)
      .select()

    if (treatmentsError) {
      console.error('❌ Error adding treatments:', treatmentsError.message)
    } else {
      console.log(`✅ Added ${treatments?.length || 0} treatments`)
    }

    // Step 2: Add patients and their visits
    console.log('\n👥 Adding patients and visits...')

    for (let i = 0; i < realWorldData.patients.length; i++) {
      const patient = realWorldData.patients[i]
      const visitScenarios = realWorldData.visitScenarios[i]

      // Add patient
      const { data: newPatient, error: patientError } = await supabase
        .from('patients')
        .insert(patient)
        .select()
        .single()

      if (patientError) {
        console.error(`❌ Error adding patient ${patient.first_name}:`, patientError.message)
        continue
      }

      console.log(`✅ Added patient: ${newPatient.first_name} ${newPatient.last_name}`)

      // Add visits for this patient
      for (const visitScenario of visitScenarios) {
        // Create visit
        const { data: visit, error: visitError } = await supabase
          .from('visits')
          .insert({
            patient_id: newPatient.id,
            ...visitScenario
          })
          .select()
          .single()

        if (visitError) {
          console.error(`❌ Error adding visit for ${newPatient.first_name}:`, visitError.message)
          continue
        }

        console.log(`  ✅ Added visit: ${visit.visit_type} on ${visit.visit_date}`)

        // Add visit treatments and create bill
        if (visitScenario.visit_treatments && visitScenario.visit_treatments.length > 0) {
          let subtotal = 0

          // Add visit treatments
          const visitTreatments = visitScenario.visit_treatments.map(treatment => {
            subtotal += treatment.quantity * treatment.unit_price_cents
            return {
              visit_id: visit.id,
              treatment_name: treatment.treatment_name,
              quantity: treatment.quantity,
              unit_price_cents: treatment.unit_price_cents,
              total_cents: treatment.quantity * treatment.unit_price_cents
            }
          })

          const { error: visitTreatmentsError } = await supabase
            .from('visit_treatments')
            .insert(visitTreatments)

          if (visitTreatmentsError) {
            console.error(`❌ Error adding visit treatments:`, visitTreatmentsError.message)
          } else {
            console.log(`    ✅ Added ${visitTreatments.length} treatments`)
          }

          // Create bill
          const tax = Math.round(subtotal * 0.1) // 10% tax
          const total = subtotal + tax

          const { data: bill, error: billError } = await supabase
            .from('bills')
            .insert({
              visit_id: visit.id,
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
            console.log(`    💰 Created bill: ₹${(total / 100).toFixed(2)}`)

            // Add bill items
            const billItems = visitTreatments.map(vt => ({
              bill_id: bill.id,
              treatment_name: vt.treatment_name,
              quantity: vt.quantity,
              unit_price_cents: vt.unit_price_cents,
              total_cents: vt.total_cents
            }))

            const { error: billItemsError } = await supabase
              .from('bill_items')
              .insert(billItems)

            if (billItemsError) {
              console.error(`❌ Error adding bill items:`, billItemsError.message)
            }
          }
        }
      }
    }

    // Step 3: Add some expenses
    console.log('\n💸 Adding clinic expenses...')

    const expenses = [
      {
        description: 'Monthly rent for clinic space',
        amount: 50000,
        category: 'Rent',
        expense_date: new Date().toISOString().split('T')[0]
      },
      {
        description: 'Medical supplies and equipment',
        amount: 25000,
        category: 'Supplies',
        expense_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        description: 'Staff salaries',
        amount: 150000,
        category: 'Salaries',
        expense_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        description: 'Electricity and utilities',
        amount: 15000,
        category: 'Utilities',
        expense_date: new Date().toISOString().split('T')[0]
      },
      {
        description: 'Medical equipment maintenance',
        amount: 30000,
        category: 'Maintenance',
        expense_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ]

    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .insert(expenses)
      .select()

    if (expensesError) {
      console.error('❌ Error adding expenses:', expensesError.message)
    } else {
      console.log(`✅ Added ${expensesData?.length || 0} expenses`)
    }

    // Step 4: Add some products to inventory
    console.log('\n📦 Adding inventory products...')

    const products = [
      {
        name: 'Paracetamol 500mg',
        description: 'Pain relief medication',
        category: 'Medicine',
        unit_price_cents: 550,
        stock_quantity: 500,
        min_stock_level: 50,
        unit: 'tablet'
      },
      {
        name: 'Bandage Roll (5cm x 5m)',
        description: 'Medical bandage for wound dressing',
        category: 'Medical Supplies',
        unit_price_cents: 200,
        stock_quantity: 200,
        min_stock_level: 20,
        unit: 'roll'
      },
      {
        name: 'Disposable Syringe 5ml',
        description: 'Sterile disposable syringe',
        category: 'Medical Supplies',
        unit_price_cents: 150,
        stock_quantity: 1000,
        min_stock_level: 100,
        unit: 'piece'
      },
      {
        name: 'Blood Pressure Monitor',
        description: 'Digital blood pressure monitoring device',
        category: 'Equipment',
        unit_price_cents: 250000,
        stock_quantity: 5,
        min_stock_level: 1,
        unit: 'piece'
      },
      {
        name: 'Thermometer (Digital)',
        description: 'Digital thermometer for temperature measurement',
        category: 'Equipment',
        unit_price_cents: 8000,
        stock_quantity: 20,
        min_stock_level: 5,
        unit: 'piece'
      }
    ]

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .insert(products)
      .select()

    if (productsError) {
      console.error('❌ Error adding products:', productsError.message)
    } else {
      console.log(`✅ Added ${productsData?.length || 0} products`)
    }

    console.log('\n🎉 Real-world data setup complete!')
    console.log('================================')
    console.log('✅ 5 patients with realistic medical histories')
    console.log('✅ Multiple visits with treatment records')
    console.log('✅ Bills with proper calculations')
    console.log('✅ Clinic expenses for financial tracking')
    console.log('✅ Inventory products for stock management')
    console.log('')
    console.log('💡 The dashboard will now show realistic data!')
    console.log('💡 Patient details pages will show visit history!')
    console.log('💡 Revenue calculations will be based on real bills!')

  } catch (error) {
    console.error('❌ Error adding real-world data:', error.message)
  }
}

// Run the script
addRealWorldData()
