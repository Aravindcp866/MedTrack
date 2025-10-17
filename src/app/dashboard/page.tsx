'use client'

import { useQuery } from '@tanstack/react-query'
import { getRevenueStats, getMonthlyRevenueData, getFounderPayout } from '@/lib/api/revenue'
import { getExpensesByCategory } from '@/lib/api/expenses'
import { getProducts } from '@/lib/api/products'
import { getPatients } from '@/lib/api/patients'
import { getBills } from '@/lib/api/billing'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  DollarSign, 
  Users, 
  Package, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle
} from 'lucide-react'
import ConnectionTest from '@/components/ConnectionTest'

export default function Dashboard() {
  // Get current month date range
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  const startDate = startOfMonth.toISOString().split('T')[0]
  const endDate = endOfMonth.toISOString().split('T')[0]

  // Fetch data
  const { data: revenueStats, isLoading: revenueLoading, error: revenueError } = useQuery({
    queryKey: ['revenue-stats', startDate, endDate],
    queryFn: () => getRevenueStats(startDate, endDate),
    retry: 1,
    retryDelay: 1000,
  })

  const { data: monthlyData, isLoading: monthlyLoading, error: monthlyError } = useQuery({
    queryKey: ['monthly-revenue'],
    queryFn: () => getMonthlyRevenueData(6),
    retry: 1,
    retryDelay: 1000,
  })

  const { data: expensesByCategory, isLoading: expensesLoading, error: expensesError } = useQuery({
    queryKey: ['expenses-by-category', startDate, endDate],
    queryFn: () => getExpensesByCategory(startDate, endDate),
    retry: 1,
    retryDelay: 1000,
  })

  const { data: founderPayout } = useQuery({
    queryKey: ['founder-payout', startDate, endDate],
    queryFn: () => getFounderPayout(startDate, endDate),
    retry: 1,
    retryDelay: 1000,
  })

  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    retry: 1,
    retryDelay: 1000,
  })

  const { data: patients, isLoading: patientsLoading, error: patientsError } = useQuery({
    queryKey: ['patients'],
    queryFn: getPatients,
    retry: 1,
    retryDelay: 1000,
  })

  const { data: bills, isLoading: billsLoading, error: billsError } = useQuery({
    queryKey: ['bills'],
    queryFn: getBills,
    retry: 1,
    retryDelay: 1000,
  })

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`
  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`

  // Calculate low stock products
  const lowStockProducts = products?.filter(p => p.stock_quantity <= p.min_stock_level) || []
  const pendingBills = bills?.filter(b => b.payment_status === 'pending') || []

  // Chart colors
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  if (revenueLoading || monthlyLoading || expensesLoading || productsLoading || patientsLoading || billsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Handle errors
  const hasError = revenueError || monthlyError || expensesError || productsError || patientsError || billsError
  
  if (hasError) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h2 className="text-xl font-semibold mb-2">Database Connection Error</h2>
            <p className="mb-4">The database schema hasn&apos;t been applied yet. Please follow these steps:</p>
            <div className="text-left max-w-md mx-auto">
              <ol className="list-decimal list-inside space-y-2">
                <li>Go to your Supabase dashboard</li>
                <li>Navigate to SQL Editor</li>
                <li>Copy and run the contents of supabase-schema-working.sql</li>
                <li>Create a storage bucket named &quot;invoices&quot;</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handle case where data is not available yet
  if (!revenueStats && !monthlyData && !expensesByCategory && !products && !patients && !bills) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Please wait while we load your clinic data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your clinic&apos;s performance</p>
        <div className="mt-4">
          <ConnectionTest />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(revenueStats?.monthlyRevenue || 0)}
              </p>
              {revenueStats && (
                <div className="flex items-center mt-1">
                  {revenueStats.revenueGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${
                    revenueStats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(revenueStats.revenueGrowth)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{patients?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Products</p>
              <p className="text-2xl font-bold text-gray-900">{products?.length || 0}</p>
              {lowStockProducts.length > 0 && (
                <div className="flex items-center mt-1">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">{lowStockProducts.length} low stock</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Bills</p>
              <p className="text-2xl font-bold text-gray-900">{pendingBills.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Revenue vs Expenses */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${(value / 100).toFixed(0)}`} />
              <Tooltip formatter={(value) => [formatPrice(Number(value)), '']} />
              <Bar dataKey="revenue" fill="#4f46e5" name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Revenue Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueStats?.weeklyRevenue.map((amount, index) => ({
              week: `Week ${index + 1}`,
              revenue: amount
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis tickFormatter={(value) => `$${(value / 100).toFixed(0)}`} />
              <Tooltip formatter={(value) => [formatPrice(Number(value)), 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses by Category and Founder Payout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total"
              >
                {expensesByCategory?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatPrice(Number(value)), 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Founder Payout</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {formatPrice(founderPayout || 0)}
            </div>
            <p className="text-gray-600 mb-4">20% of net revenue this month</p>
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Net Revenue: {formatPrice((revenueStats?.monthlyRevenue || 0) - (monthlyData?.[monthlyData.length - 1]?.expenses || 0))}
              </p>
              <p className="text-sm text-gray-600">
                Founder Share: 20%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
