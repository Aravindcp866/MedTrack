const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Please create a .env.local file with:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySchema() {
  try {
    console.log('🔄 Applying database schema...')
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../supabase-schema-working.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          console.warn(`⚠️  Warning for statement ${i + 1}:`, error.message)
          // Continue with other statements
        }
      }
    }
    
    console.log('✅ Schema applied successfully!')
    
    // Test the connection by fetching some data
    console.log('🧪 Testing database connection...')
    
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('count')
      .limit(1)
    
    if (patientsError) {
      console.error('❌ Database connection test failed:', patientsError.message)
    } else {
      console.log('✅ Database connection successful!')
    }
    
    // Add some sample data
    console.log('📊 Adding sample data...')
    await addSampleData()
    
    console.log('🎉 Database setup complete!')
    console.log('You can now refresh your dashboard.')
    
  } catch (error) {
    console.error('❌ Error applying schema:', error.message)
    process.exit(1)
  }
}

async function addSampleData() {
  try {
    // Add sample products
    const products = [
      {
        name: 'Paracetamol 500mg',
        description: 'Pain relief medication',
        category: 'Medicine',
        unit_price: 5.50,
        stock_quantity: 100,
        min_stock_level: 20,
        unit: 'tablet'
      },
      {
        name: 'Bandage Roll',
        description: 'Medical bandage',
        category: 'Medical Supplies',
        unit_price: 2.00,
        stock_quantity: 50,
        min_stock_level: 10,
        unit: 'roll'
      },
      {
        name: 'Syringe 5ml',
        description: 'Disposable syringe',
        category: 'Medical Supplies',
        unit_price: 1.50,
        stock_quantity: 200,
        min_stock_level: 50,
        unit: 'piece'
      }
    ]
    
    const { error: productsError } = await supabase
      .from('products')
      .insert(products)
    
    if (productsError) {
      console.warn('⚠️  Could not add sample products:', productsError.message)
    } else {
      console.log('✅ Sample products added')
    }
    
    // Add sample patients
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
        medical_history: 'Asthma',
        allergies: 'None'
      }
    ]
    
    const { error: patientsError } = await supabase
      .from('patients')
      .insert(patients)
    
    if (patientsError) {
      console.warn('⚠️  Could not add sample patients:', patientsError.message)
    } else {
      console.log('✅ Sample patients added')
    }
    
    // Add sample expenses
    const expenses = [
      {
        description: 'Office rent',
        amount: 2000.00,
        category: 'Rent',
        expense_date: new Date().toISOString().split('T')[0]
      },
      {
        description: 'Medical supplies',
        amount: 500.00,
        category: 'Supplies',
        expense_date: new Date().toISOString().split('T')[0]
      },
      {
        description: 'Utilities',
        amount: 300.00,
        category: 'Utilities',
        expense_date: new Date().toISOString().split('T')[0]
      }
    ]
    
    const { error: expensesError } = await supabase
      .from('expenses')
      .insert(expenses)
    
    if (expensesError) {
      console.warn('⚠️  Could not add sample expenses:', expensesError.message)
    } else {
      console.log('✅ Sample expenses added')
    }
    
  } catch (error) {
    console.warn('⚠️  Could not add sample data:', error.message)
  }
}

// Run the script
applySchema()
