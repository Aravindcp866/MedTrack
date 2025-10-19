const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testDatabase() {
  try {
    console.log('🔍 Checking database connection and data...');
    
    // Test basic connection
    const { data: patients, error: pError } = await supabase.from('patients').select('count', { count: 'exact' });
    console.log('Patients count:', patients?.[0]?.count || 0);
    
    // Test products
    const { data: products, error: prodError } = await supabase.from('products').select('count', { count: 'exact' });
    console.log('Products count:', products?.[0]?.count || 0);
    
    // Test bills
    const { data: bills, error: bError } = await supabase.from('bills').select('count', { count: 'exact' });
    console.log('Bills count:', bills?.[0]?.count || 0);
    
    // Test expenses
    const { data: expenses, error: eError } = await supabase.from('expenses').select('count', { count: 'exact' });
    console.log('Expenses count:', expenses?.[0]?.count || 0);
    
    if (pError) console.log('Patients error:', pError.message);
    if (prodError) console.log('Products error:', prodError.message);
    if (bError) console.log('Bills error:', bError.message);
    if (eError) console.log('Expenses error:', eError.message);
    
  } catch (err) {
    console.error('Connection error:', err.message);
  }
}

testDatabase();
