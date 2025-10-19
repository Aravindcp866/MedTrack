const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testVisits() {
  try {
    console.log('🔍 Testing visits API...');
    
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Visits error:', error.message);
    } else {
      console.log('✅ Visits query successful');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testVisits();
