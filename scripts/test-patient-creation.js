const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testPatientCreation() {
  try {
    console.log('🔍 Testing patient creation...');
    
    const testPatient = {
      first_name: 'Test',
      last_name: 'Patient',
      email: 'test@example.com',
      phone: '1234567890'
    };
    
    const { data, error } = await supabase
      .from('patients')
      .insert(testPatient)
      .select()
      .single();
    
    if (error) {
      console.log('❌ Patient creation error:', error.message);
    } else {
      console.log('✅ Patient created successfully:', data);
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testPatientCreation();
