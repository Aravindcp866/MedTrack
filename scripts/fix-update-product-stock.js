const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createUpdateProductStockFunction() {
  try {
    console.log('🔄 Creating update_product_stock function...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.update_product_stock(
            product_id UUID,
            quantity_change INTEGER
        )
        RETURNS VOID AS $$
        BEGIN
            UPDATE public.products 
            SET stock_quantity = stock_quantity + quantity_change,
                updated_at = NOW()
            WHERE id = product_id;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    if (error) {
      console.error('❌ Error creating function:', error);
      return;
    }

    console.log('✅ update_product_stock function created successfully!');
    
    // Test the function
    console.log('🔄 Testing the function...');
    const { data: testData, error: testError } = await supabase.rpc('update_product_stock', {
      product_id: '00000000-0000-0000-0000-000000000000',
      quantity_change: 0
    });
    
    if (testError) {
      console.error('❌ Function test failed:', testError);
    } else {
      console.log('✅ Function test passed!');
    }
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

createUpdateProductStockFunction();
