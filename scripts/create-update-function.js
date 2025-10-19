const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createUpdateFunction() {
  try {
    console.log('🔄 Checking database access...');
    
    // Test database access
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database access error:', error);
      return;
    }
    
    console.log('✅ Database access successful');
    console.log('');
    console.log('📝 The update_product_stock function needs to be created manually.');
    console.log('Please execute the following SQL in your Supabase SQL Editor:');
    console.log('');
    console.log('```sql');
    console.log('CREATE OR REPLACE FUNCTION public.update_product_stock(');
    console.log('    product_id UUID,');
    console.log('    quantity_change INTEGER');
    console.log(')');
    console.log('RETURNS VOID AS $$');
    console.log('BEGIN');
    console.log('    UPDATE public.products');
    console.log('    SET stock_quantity = stock_quantity + quantity_change,');
    console.log('        updated_at = NOW()');
    console.log('    WHERE id = product_id;');
    console.log('END;');
    console.log('$$ LANGUAGE plpgsql;');
    console.log('```');
    console.log('');
    console.log('After creating the function, the bill items should work correctly.');
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

createUpdateFunction();
