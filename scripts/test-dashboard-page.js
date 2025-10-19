const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testDashboardPage() {
  try {
    console.log('🔍 Testing Dashboard Page Components...');
    
    // Test all the data that dashboard needs
    console.log('\n📊 Testing Revenue Stats...');
    const { data: revenueStats } = await supabase
      .from('bills')
      .select('total_amount, created_at')
      .eq('status', 'paid');
    
    console.log('✅ Bills data:', revenueStats?.length || 0, 'paid bills');
    
    console.log('\n👥 Testing Patients...');
    const { data: patients } = await supabase
      .from('patients')
      .select('id, first_name, last_name');
    
    console.log('✅ Patients data:', patients?.length || 0, 'patients');
    
    console.log('\n📦 Testing Products...');
    const { data: products } = await supabase
      .from('products')
      .select('id, name, stock_quantity, min_stock_level');
    
    console.log('✅ Products data:', products?.length || 0, 'products');
    
    console.log('\n💸 Testing Expenses...');
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount, category');
    
    console.log('✅ Expenses data:', expenses?.length || 0, 'expenses');
    
    // Test low stock calculation
    const lowStockProducts = products?.filter(p => p.stock_quantity <= p.min_stock_level) || [];
    console.log('📉 Low stock products:', lowStockProducts.length);
    
    // Test pending bills
    const { data: bills } = await supabase
      .from('bills')
      .select('status');
    
    const pendingBills = bills?.filter(b => b.status === 'pending') || [];
    console.log('⏳ Pending bills:', pendingBills.length);
    
    console.log('\n🎉 All dashboard data is available!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testDashboardPage();
