const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testVisitCreation() {
  try {
    console.log('🔍 Testing visit creation...');
    
    // Get first patient
    const { data: patients } = await supabase.from('patients').select('id, first_name, last_name').limit(1);
    
    if (!patients || patients.length === 0) {
      console.log('❌ No patients found');
      return;
    }
    
    const patient = patients[0];
    console.log(`Creating visit for patient: ${patient.first_name} ${patient.last_name}`);
    
    // Test visit creation
    const visitData = {
      patient_id: patient.id,
      visit_date: new Date().toISOString().split('T')[0],
      visit_type: 'consultation',
      status: 'completed',
      treatment_notes: 'Test consultation visit',
      amount: 100.00
    };
    
    const { data: visit, error } = await supabase
      .from('visits')
      .insert({
        patient_id: visitData.patient_id,
        visit_date: visitData.visit_date,
        visit_type: visitData.visit_type,
        status: visitData.status,
        treatment_notes: visitData.treatment_notes
      })
      .select()
      .single();
    
    if (error) {
      console.log('❌ Visit creation error:', error.message);
      return;
    }
    
    console.log('✅ Visit created successfully:', visit.id);
    
    // Create bill for the visit
    const billNumber = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const amount = visitData.amount;
    const tax = amount * 0.1;
    const total = amount + tax;
    
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .insert({
        patient_id: visitData.patient_id,
        visit_id: visit.id,
        bill_number: billNumber,
        total_amount: total,
        status: 'paid',
        payment_method: 'cash',
        payment_date: new Date().toISOString(),
        notes: visitData.treatment_notes
      })
      .select()
      .single();
    
    if (billError) {
      console.log('❌ Bill creation error:', billError.message);
    } else {
      console.log('✅ Bill created successfully:', bill.bill_number, `$${bill.total_amount}`);
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testVisitCreation();
