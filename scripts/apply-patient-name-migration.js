const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
  try {
    console.log('🔄 Applying patient name migration...')

    // Add patient_name column to bills table
    console.log('📝 Adding patient_name column to bills table...')
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS patient_name TEXT;'
    })

    if (alterError) {
      console.error('Error adding patient_name column:', alterError)
      return
    }

    // Update existing bills with patient names
    console.log('🔄 Updating existing bills with patient names...')
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.bills 
        SET patient_name = CONCAT(p.first_name, ' ', p.last_name)
        FROM public.patients p 
        WHERE bills.patient_id = p.id AND bills.patient_name IS NULL;
      `
    })

    if (updateError) {
      console.error('Error updating patient names:', updateError)
      return
    }

    // Create index for better performance
    console.log('📊 Creating index for patient_name...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_bills_patient_name ON public.bills(patient_name);'
    })

    if (indexError) {
      console.error('Error creating index:', indexError)
      return
    }

    // Update the bill number generation function
    console.log('🔧 Updating bill number generation function...')
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION generate_bill_number()
        RETURNS TEXT AS $$
        DECLARE
            patient_name TEXT;
            bill_count INTEGER;
            bill_number TEXT;
        BEGIN
            -- Get the patient name from the most recent visit
            SELECT CONCAT(p.first_name, ' ', p.last_name) INTO patient_name
            FROM public.visits v
            JOIN public.patients p ON v.patient_id = p.id
            ORDER BY v.created_at DESC
            LIMIT 1;
            
            -- Get count of bills for this patient
            SELECT COUNT(*) INTO bill_count
            FROM public.bills
            WHERE patient_name = patient_name;
            
            -- Generate bill number: PatientName-Bill-001, PatientName-Bill-002, etc.
            bill_number := CONCAT(
                REPLACE(patient_name, ' ', ''), 
                '-Bill-', 
                LPAD((bill_count + 1)::TEXT, 3, '0')
            );
            
            RETURN bill_number;
        END;
        $$ LANGUAGE plpgsql;
      `
    })

    if (functionError) {
      console.error('Error updating function:', functionError)
      return
    }

    console.log('✅ Migration completed successfully!')
    console.log('📋 Summary:')
    console.log('  - Added patient_name column to bills table')
    console.log('  - Updated existing bills with patient names')
    console.log('  - Created index for better performance')
    console.log('  - Updated bill number generation to include patient names')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

applyMigration()
