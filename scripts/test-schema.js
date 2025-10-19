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

async function testSchema() {
  console.log('🔍 Testing Database Schema...')
  console.log('=============================\n')

  try {
    // Test 1: Check if tables exist
    console.log('1. Checking table existence...')

    const tables = ['patients', 'visits', 'treatments', 'visit_treatments', 'bills', 'bill_items', 'products', 'expenses']

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)

        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: OK`)
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
      }
    }

    // Test 2: Test basic insertions
    console.log('\n2. Testing basic insertions...')

    // Test treatment insertion
    try {
      const { data: treatment, error: tError } = await supabase
        .from('treatments')
        .insert({ name: 'Test Treatment', price_cents: 10000 })
        .select()
        .single()

      if (tError) {
        console.log(`❌ Treatment insertion: ${tError.message}`)
      } else {
        console.log(`✅ Treatment insertion: ${treatment.name}`)

        // Clean up
        await supabase.from('treatments').delete().eq('id', treatment.id)
      }
    } catch (err) {
      console.log(`❌ Treatment insertion: ${err.message}`)
    }

    console.log('\n✅ Schema test complete!')

  } catch (error) {
    console.error('❌ Schema test failed:', error.message)
  }
}

testSchema()
