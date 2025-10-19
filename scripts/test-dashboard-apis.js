const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testDashboardAPIs() {
  try {
    console.log('🔍 Testing Dashboard API endpoints...');
    
    // Test revenue stats API
    console.log('\n📊 Testing Revenue Stats API...');
    try {
      const response = await fetch('http://localhost:3000/api/revenue/stats');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Revenue Stats API working:', {
          monthlyRevenue: data.monthlyRevenue,
          totalPatients: data.totalPatients,
          treatmentRevenue: data.treatmentRevenue
        });
      } else {
        console.log('❌ Revenue Stats API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ Revenue Stats API error:', error.message);
    }
    
    // Test monthly revenue API
    console.log('\n📈 Testing Monthly Revenue API...');
    try {
      const response = await fetch('http://localhost:3000/api/revenue/monthly');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Monthly Revenue API working:', data.length, 'months');
      } else {
        console.log('❌ Monthly Revenue API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ Monthly Revenue API error:', error.message);
    }
    
    // Test expenses by category API
    console.log('\n💸 Testing Expenses by Category API...');
    try {
      const response = await fetch('http://localhost:3000/api/expenses/by-category');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Expenses by Category API working:', data.length, 'categories');
      } else {
        console.log('❌ Expenses by Category API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ Expenses by Category API error:', error.message);
    }
    
    // Test products API
    console.log('\n📦 Testing Products API...');
    try {
      const response = await fetch('http://localhost:3000/api/products');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Products API working:', data.length, 'products');
      } else {
        console.log('❌ Products API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ Products API error:', error.message);
    }
    
    // Test patients API
    console.log('\n👥 Testing Patients API...');
    try {
      const response = await fetch('http://localhost:3000/api/patients');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Patients API working:', data.length, 'patients');
      } else {
        console.log('❌ Patients API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ Patients API error:', error.message);
    }
    
    // Test bills API
    console.log('\n💰 Testing Bills API...');
    try {
      const response = await fetch('http://localhost:3000/api/bills');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Bills API working:', data.length, 'bills');
      } else {
        console.log('❌ Bills API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ Bills API error:', error.message);
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testDashboardAPIs();
