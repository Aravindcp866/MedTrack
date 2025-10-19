const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addSampleExpenses() {
  try {
    console.log('💸 Adding sample expenses...');
    
    const expenses = [
      { description: 'Office Rent', amount: 1000.00, category: 'Rent', expense_date: new Date().toISOString().split('T')[0] },
      { description: 'Medical Supplies', amount: 500.00, category: 'Supplies', expense_date: new Date().toISOString().split('T')[0] },
      { description: 'Staff Salaries', amount: 2000.00, category: 'Salaries', expense_date: new Date().toISOString().split('T')[0] },
      { description: 'Equipment Maintenance', amount: 300.00, category: 'Maintenance', expense_date: new Date().toISOString().split('T')[0] },
      { description: 'Utilities', amount: 200.00, category: 'Utilities', expense_date: new Date().toISOString().split('T')[0] }
    ];
    
    for (const expense of expenses) {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expense)
        .select()
        .single();
      
      if (error) {
        console.log(`❌ Error creating expense ${expense.description}:`, error.message);
      } else {
        console.log(`✅ Created expense: ${expense.description} - $${expense.amount}`);
      }
    }
    
    console.log('🎉 Sample expenses added successfully!');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

addSampleExpenses();
