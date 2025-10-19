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

async function resetAndPopulate() {
  console.log('🔄 Resetting and Populating ClinicSync Database...')
  console.log('================================================\n')

  try {
    // Step 1: Delete all existing data
    console.log('🗑️  Deleting existing data...')
    await supabase.from('bill_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('bills').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('visit_treatments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('visits').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('patients').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('treatments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('revenue_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('✅ All existing data deleted\n')

    // Step 2: Add treatments
    console.log('🏥 Adding treatments...')
    const treatments = [
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
    ]

    const { data: treatmentsData, error: treatmentsError } = await supabase
      .from('treatments')
      .insert(treatments)
      .select()

    if (treatmentsError) {
      console.error('❌ Error adding treatments:', treatmentsError.message)
      return
    }

    console.log(`✅ Added ${treatmentsData?.length || 0} treatments\n`)

    // Step 3: Add products
    console.log('📦 Adding inventory products...')
    const products = [
      { name: 'Paracetamol 500mg', description: 'Pain relief medication', category: 'Medicine', unit_price: 5.50, stock_quantity: 500, min_stock_level: 50, unit: 'tablet' },
      { name: 'Bandage Roll (5cm x 5m)', description: 'Medical bandage for wound dressing', category: 'Medical Supplies', unit_price: 2.00, stock_quantity: 200, min_stock_level: 20, unit: 'roll' },
      { name: 'Disposable Syringe 5ml', description: 'Sterile disposable syringe', category: 'Medical Supplies', unit_price: 1.50, stock_quantity: 1000, min_stock_level: 100, unit: 'piece' },
      { name: 'Blood Pressure Monitor', description: 'Digital blood pressure monitoring device', category: 'Equipment', unit_price: 2500.00, stock_quantity: 5, min_stock_level: 1, unit: 'piece' },
      { name: 'Thermometer (Digital)', description: 'Digital thermometer for temperature measurement', category: 'Equipment', unit_price: 80.00, stock_quantity: 20, min_stock_level: 5, unit: 'piece' },
      { name: 'Stethoscope', description: 'Medical stethoscope for auscultation', category: 'Equipment', unit_price: 1500.00, stock_quantity: 3, min_stock_level: 1, unit: 'piece' },
      { name: 'Gloves (Latex) Box', description: 'Box of 100 latex examination gloves', category: 'Medical Supplies', unit_price: 1200.00, stock_quantity: 50, min_stock_level: 10, unit: 'box' },
      { name: 'Antiseptic Solution', description: 'Medical antiseptic solution', category: 'Medicine', unit_price: 350.00, stock_quantity: 30, min_stock_level: 5, unit: 'bottle' },
    ]

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .insert(products)
      .select()

    if (productsError) {
      console.error('❌ Error adding products:', productsError.message)
      return
    }

    console.log(`✅ Added ${productsData?.length || 0} products\n`)

    // Step 4: Add patients
    console.log('👥 Adding patients...')
    const patients = [
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
    ]

    const { data: patientsData, error: patientsError } = await supabase
      .from('patients')
      .insert(patients)
      .select()

    if (patientsError) {
      console.error('❌ Error adding patients:', patientsError.message)
      return
    }

    console.log(`✅ Added ${patientsData?.length || 0} patients\n`)

    // Step 5: Create visits and bills
    console.log('📋 Creating visits and bills...')

    const visitScenarios = [
      // Rajesh Kumar - Hypertension management
      [
        {
          visit_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visit_type: 'consultation',
          chief_complaint: 'High blood pressure readings at home',
          diagnosis: 'Hypertension',
          treatment_notes: 'Patient presents with elevated BP. Started on antihypertensive medication. Diet and exercise counseling provided.',
          status: 'completed',
          treatments: [
            { treatment_name: 'General Consultation', quantity: 1, unit_price_cents: 50000 },
            { treatment_name: 'Blood Test (CBC)', quantity: 1, unit_price_cents: 80000 }
          ],
          inventory_purchases: [
            { product_name: 'Blood Pressure Monitor', quantity: 1, unit_price_cents: 250000 }
          ]
        },
        {
          visit_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visit_type: 'follow_up',
          chief_complaint: 'Medication side effects',
          diagnosis: 'Medication adjustment needed',
          treatment_notes: 'BP improved but patient experiencing dry cough from ACE inhibitor. Switching to ARB class medication.',
          status: 'completed',
          treatments: [
            { treatment_name: 'General Consultation', quantity: 1, unit_price_cents: 50000 },
            { treatment_name: 'Blood Pressure Check', quantity: 1, unit_price_cents: 20000 }
          ]
        },
        {
          visit_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visit_type: 'follow_up',
          chief_complaint: 'Routine check-up',
          diagnosis: 'Hypertension well controlled',
          treatment_notes: 'BP readings stable at 130/85. Patient compliant with medication and lifestyle changes. Excellent progress.',
          status: 'completed',
          treatments: [
            { treatment_name: 'General Consultation', quantity: 1, unit_price_cents: 50000 },
            { treatment_name: 'Blood Pressure Check', quantity: 1, unit_price_cents: 20000 }
          ]
        }
      ],

      // Anita Sharma - Diabetes management
      [
        {
          visit_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visit_type: 'consultation',
          chief_complaint: 'Increased thirst and frequent urination',
          diagnosis: 'Type 2 Diabetes Mellitus',
          treatment_notes: 'New diagnosis of T2DM. HbA1c 8.2%. Started on metformin and lifestyle counseling.',
          status: 'completed',
          treatments: [
            { treatment_name: 'Diabetes Check-up', quantity: 1, unit_price_cents: 150000 },
            { treatment_name: 'Blood Test (CBC)', quantity: 1, unit_price_cents: 80000 }
          ],
          inventory_purchases: [
            { product_name: 'Thermometer (Digital)', quantity: 1, unit_price_cents: 8000 }
          ]
        },
        {
          visit_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visit_type: 'follow_up',
          chief_complaint: 'Blood sugar monitoring',
          diagnosis: 'Diabetes management improving',
          treatment_notes: 'HbA1c improved to 7.1%. Patient following diet and exercise plan well. Glucose readings stabilizing.',
          status: 'completed',
          treatments: [
            { treatment_name: 'General Consultation', quantity: 1, unit_price_cents: 50000 },
            { treatment_name: 'Blood Test (CBC)', quantity: 1, unit_price_cents: 80000 }
          ]
        }
      ],

      // Arjun Patel - Cardiac care
      [
        {
          visit_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visit_type: 'follow_up',
          chief_complaint: 'Post-operative chest pain',
          diagnosis: 'Post-operative pericarditis',
          treatment_notes: 'Mild pericarditis post CABG. Started on colchicine and NSAIDs. Pain well controlled.',
          status: 'completed',
          treatments: [
            { treatment_name: 'ECG', quantity: 1, unit_price_cents: 100000 },
            { treatment_name: 'General Consultation', quantity: 1, unit_price_cents: 50000 }
          ]
        },
        {
          visit_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visit_type: 'consultation',
          chief_complaint: 'Irregular heartbeat sensation',
          diagnosis: 'Atrial fibrillation',
          treatment_notes: 'New onset AF detected on ECG. Started on beta blocker and anticoagulation therapy.',
          status: 'completed',
          treatments: [
            { treatment_name: 'ECG', quantity: 1, unit_price_cents: 100000 },
            { treatment_name: 'General Consultation', quantity: 1, unit_price_cents: 50000 }
          ],
          inventory_purchases: [
            { product_name: 'Stethoscope', quantity: 1, unit_price_cents: 150000 }
          ]
        }
      ],

      // Priya Singh - Thyroid issues
      [
        {
          visit_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visit_type: 'consultation',
          chief_complaint: 'Fatigue and weight gain',
          diagnosis: 'Hypothyroidism',
          treatment_notes: 'TSH elevated at 12.5. Started on levothyroxine replacement therapy.',
          status: 'completed',
          treatments: [
            { treatment_name: 'General Consultation', quantity: 1, unit_price_cents: 50000 },
            { treatment_name: 'Blood Test (CBC)', quantity: 1, unit_price_cents: 80000 }
          ]
        }
      ],

      // Vikram Reddy - Asthma management
      [
        {
          visit_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visit_type: 'emergency',
          chief_complaint: 'Acute asthma attack',
          diagnosis: 'Acute asthma exacerbation',
          treatment_notes: 'Severe asthma attack triggered by dust exposure. Treated with nebulized bronchodilators and steroids.',
          status: 'completed',
          treatments: [
            { treatment_name: 'General Consultation', quantity: 1, unit_price_cents: 50000 },
            { treatment_name: 'Vaccination (Flu)', quantity: 1, unit_price_cents: 80000 }
          ],
          inventory_purchases: [
            { product_name: 'Disposable Syringe 5ml', quantity: 5, unit_price_cents: 150 }
          ]
        },
        {
          visit_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visit_type: 'follow_up',
          chief_complaint: 'Persistent cough',
          diagnosis: 'Post-viral cough',
          treatment_notes: 'Asthma well controlled post-attack. Cough likely post-viral. Symptomatic treatment recommended.',
          status: 'completed',
          treatments: [
            { treatment_name: 'General Consultation', quantity: 1, unit_price_cents: 50000 }
          ]
        }
      ]
    ]

    // Create visits and bills for each patient
    for (let i = 0; i < patientsData.length && i < visitScenarios.length; i++) {
      const patient = patientsData[i]
      const patientVisits = visitScenarios[i]

      console.log(`📋 Processing visits for ${patient.first_name} ${patient.last_name}...`)

      for (const visitData of patientVisits) {
        try {
          // Create visit
          const { data: visit, error: visitError } = await supabase
            .from('visits')
            .insert({
              patient_id: patient.id,
              visit_date: visitData.visit_date,
              visit_type: visitData.visit_type,
              chief_complaint: visitData.chief_complaint,
              diagnosis: visitData.diagnosis,
              treatment_notes: visitData.treatment_notes,
              status: visitData.status
            })
            .select()
            .single()

          if (visitError) {
            console.error(`❌ Error creating visit for ${patient.first_name}:`, visitError.message)
            continue
          }

          // Add treatments to visit
          if (visitData.treatments && visitData.treatments.length > 0) {
            for (const treatment of visitData.treatments) {
              const treatmentData = treatmentsData.find(t => t.name === treatment.treatment_name)
              if (!treatmentData) {
                console.error(`❌ Treatment not found: ${treatment.treatment_name}`)
                continue
              }

              const { error: visitTreatmentsError } = await supabase
                .from('visit_treatments')
                .insert({
                  visit_id: visit.id,
                  treatment_id: treatmentData.id,
                  quantity: treatment.quantity,
                  unit_price_cents: treatment.unit_price_cents
                })

              if (visitTreatmentsError) {
                console.error(`❌ Error adding treatment to visit:`, visitTreatmentsError.message)
              }
            }
          }

          // Create bill for the visit
          if (visitData.treatments && visitData.treatments.length > 0) {
            let subtotal = 0
            const billItems = []

            for (const treatment of visitData.treatments) {
              const treatmentData = treatmentsData.find(t => t.name === treatment.treatment_name)
              if (!treatmentData) {
                console.error(`❌ Treatment not found: ${treatment.treatment_name}`)
                continue
              }

              const total = treatment.quantity * treatment.unit_price_cents
              subtotal += total
              billItems.push({
                treatment_name: treatmentData.name,
                quantity: treatment.quantity,
                unit_price_cents: treatment.unit_price_cents,
                total_cents: total
              })
            }

            if (billItems.length > 0) {
              const tax = Math.round(subtotal * 0.1) // 10% tax
              const total = subtotal + tax

              // Generate bill number (simple approach)
              const timestamp = Date.now()
              const random = Math.floor(Math.random() * 1000)
              const billNumber = `BILL-${timestamp}-${random}`

              const { data: bill, error: billError } = await supabase
                .from('bills')
                .insert({
                  visit_id: visit.id,
                  bill_number: billNumber,
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
                // Add bill items
                const billItemsData = billItems.map(item => ({
                  bill_id: bill.id,
                  treatment_name: item.treatment_name,
                  quantity: item.quantity,
                  unit_price_cents: item.unit_price_cents,
                  total_cents: item.total_cents
                }))

                const { error: billItemsError } = await supabase
                  .from('bill_items')
                  .insert(billItemsData)

                if (billItemsError) {
                  console.error(`❌ Error adding bill items:`, billItemsError.message)
                } else {
                  console.log(`  💰 Created bill: ₹${(total / 100).toFixed(2)} for ${visit.visit_type}`)
                }
              }
            }
          }

          // Handle inventory purchases
          if (visitData.inventory_purchases && visitData.inventory_purchases.length > 0) {
            for (const purchase of visitData.inventory_purchases) {
              const productData = productsData.find(p => p.name === purchase.product_name)
              if (!productData) {
                console.error(`❌ Product not found: ${purchase.product_name}`)
                continue
              }

              // Add to revenue as inventory sale
              const { error: revenueError } = await supabase
                .from('revenue_entries')
                .insert({
                  description: `Inventory sale - ${productData.name}`,
                  amount: (purchase.quantity * purchase.unit_price_cents) / 100,
                  category: 'Inventory Sales',
                  revenue_date: visit.visit_date,
                  source: 'patient_purchase'
                })

              if (revenueError) {
                console.error(`❌ Error adding inventory revenue:`, revenueError.message)
              }
            }
          }
        } catch (error) {
          console.error(`❌ Error processing visit for ${patient.first_name}:`, error.message)
        }
      }
    }

    // Step 6: Add expenses
    console.log('\n💸 Adding clinic expenses...')

    const expenses = [
      {
        description: 'Monthly rent for clinic space',
        amount: 75000,
        category: 'Rent',
        expense_date: new Date().toISOString().split('T')[0]
      },
      {
        description: 'Medical supplies and equipment',
        amount: 35000,
        category: 'Supplies',
        expense_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        description: 'Staff salaries (Doctor + 2 Nurses)',
        amount: 250000,
        category: 'Salaries',
        expense_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        description: 'Electricity and utilities',
        amount: 18000,
        category: 'Utilities',
        expense_date: new Date().toISOString().split('T')[0]
      },
      {
        description: 'Medical equipment maintenance',
        amount: 25000,
        category: 'Maintenance',
        expense_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        description: 'Insurance premium',
        amount: 15000,
        category: 'Insurance',
        expense_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        description: 'Marketing and advertising',
        amount: 12000,
        category: 'Marketing',
        expense_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ]

    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .insert(expenses)
      .select()

    if (expensesError) {
      console.error('❌ Error adding expenses:', expensesError.message)
      return
    }

    console.log(`✅ Added ${expensesData?.length || 0} expenses\n`)

    console.log('🎉 Database reset and population complete!')
    console.log('==========================================')
    console.log('✅ Realistic patient data with complete medical histories')
    console.log('✅ Multiple visits with proper treatment tracking')
    console.log('✅ Bills with accurate calculations (subtotal + 10% tax)')
    console.log('✅ Inventory purchases tracked as revenue')
    console.log('✅ Realistic clinic expenses for net profit calculation')
    console.log('')
    console.log('🏥 The complete workflow is now ready!')
    console.log('📊 Dashboard will show real daily/monthly revenue data')
    console.log('💰 Revenue = Treatment fees + Inventory sales - Expenses')

  } catch (error) {
    console.error('❌ Error during reset and population:', error.message)
  }
}

// Run the script
resetAndPopulate()
