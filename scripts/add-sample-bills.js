const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addSampleBills() {
  try {
    console.log('💰 Adding sample bills...');
    
    // Get existing patients
    const { data: patients } = await supabase.from('patients').select('id, first_name, last_name');
    
    if (!patients || patients.length === 0) {
      console.log('❌ No patients found. Please add patients first.');
      return;
    }
    
    // Create sample bills for each patient
    for (const patient of patients) {
      const billData = {
        patient_id: patient.id,
        bill_number: `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        total_amount: 150.00, // $150.00
        status: 'paid',
        payment_method: 'cash',
        payment_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('bills')
        .insert(billData)
        .select()
        .single();
      
      if (error) {
        console.log(`❌ Error creating bill for ${patient.first_name}:`, error.message);
      } else {
        console.log(`✅ Created bill for ${patient.first_name}: $${billData.total_amount}`);
      }
    }
    
    console.log('🎉 Sample bills added successfully!');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

addSampleBills();
