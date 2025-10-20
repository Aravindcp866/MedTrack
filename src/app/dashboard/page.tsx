'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { 
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
  Users, 
  Package, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  IndianRupeeIcon
} from 'lucide-react'
import ConnectionTest from '@/components/ConnectionTest'
import { useCurrency } from '@/components/CurrencySettings'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { CardSkeleton } from '@/components/ui/Skeleton'

export default function Dashboard() {
  const { formatPrice } = useCurrency()
  
  // Get current month date range
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  const startDate = startOfMonth.toISOString().split('T')[0]
  const endDate = endOfMonth.toISOString().split('T')[0]

  // Fetch data
  const { data: revenueStats, isLoading: revenueLoading, error: revenueError } = useQuery({
    queryKey: ['revenue-stats', startDate, endDate],
    queryFn: () => api.getRevenueStats(),
    retry: 1,
    retryDelay: 1000,
  })

  const { data: monthlyData, isLoading: monthlyLoading, error: monthlyError } = useQuery({
    queryKey: ['monthly-revenue'],
    queryFn: () => api.getRevenueByMonth(),
    retry: 1,
    retryDelay: 1000,
  })

  const { data: expensesByCategory, isLoading: expensesLoading, error: expensesError } = useQuery({
    queryKey: ['expenses-by-category', startDate, endDate],
    queryFn: () => api.getExpensesByCategory(),
    retry: 1,
    retryDelay: 1000,
  })


  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: api.getProducts,
    retry: 1,
    retryDelay: 1000,
  })

  const { data: patients, isLoading: patientsLoading, error: patientsError } = useQuery({
    queryKey: ['patients'],
    queryFn: api.getPatients,
    retry: 1,
    retryDelay: 1000,
  })

  const { data: bills, isLoading: billsLoading, error: billsError } = useQuery({
    queryKey: ['bills'],
    queryFn: api.getBills,
    retry: 1,
    retryDelay: 1000,
  })

  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`

  // Calculate low stock products
  const lowStockProducts = products?.filter(p => p.stock_quantity <= p.min_stock_level) || []
  const pendingBills = bills?.filter(b => b.payment_status === 'pending') || []

  // Chart colors
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  if (revenueLoading || monthlyLoading || expensesLoading || productsLoading || patientsLoading || billsLoading) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Breadcrumbs />
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
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
              <div className="bg-white p-4 rounded border">
                <h4 className="font-semibold mb-2">Quick Setup:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Run: <code>node scripts/complete-setup.js</code> (automated setup)</li>
                  <li>Or manually: Create <code>.env.local</code> with Supabase credentials</li>
                  <li>Then run: <code>node scripts/apply-schema.js</code></li>
                  <li>Refresh this page</li>
                </ol>
                <p className="mt-2 text-xs text-gray-600">
                  See <code>QUICK_SETUP.md</code> for step-by-step instructions.
                </p>
              </div>
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
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Breadcrumbs />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Overview of your clinic&apos;s performance</p>
        <div className="mt-4">
          <ConnectionTest />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <IndianRupeeIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice((revenueStats?.monthlyRevenue || 0) / 100)}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Treatments: {formatPrice((revenueStats?.treatmentRevenue || 0) / 100)} |
                  Inventory: {formatPrice((revenueStats?.inventoryRevenue || 0) / 100)}
                </span>
              </div>
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

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{revenueStats?.totalPatients || patients?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Products</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{products?.length || 0}</p>
              {lowStockProducts.length > 0 && (
                <div className="flex items-center mt-1">
                  <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400 mr-1" />
                  <span className="text-sm text-red-600 dark:text-red-400">{lowStockProducts.length} low stock</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Bills</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingBills.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Revenue vs Expenses */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatPrice(Number(value) / 100)} />
              <Tooltip formatter={(value) => [formatPrice(Number(value) / 100), '']} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#4f46e5" 
                strokeWidth={3}
                name="Revenue" 
                dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={3}
                name="Expenses" 
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Revenue Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueStats?.dailyRevenue?.map((amount, index) => ({
              day: `Day ${index + 1}`,
              revenue: amount
            })) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis tickFormatter={(value) => formatPrice(Number(value) / 100)} />
              <Tooltip formatter={(value) => [formatPrice(Number(value) / 100), 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses by Category and Founder Payout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                label={({ category }) => `${category}`}
                labelLine={true}
                innerRadius={80}
                outerRadius={150}
                fill="#8884d8"
                dataKey="total"
              >
                {expensesByCategory?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatPrice(Number(value) / 100), 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Founder Payout</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              {formatPrice(((revenueStats?.monthlyRevenue || 0) * 0.2) / 100)}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">20% of net revenue this month</p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Net Revenue: {formatPrice(((revenueStats?.monthlyRevenue || 0) - (monthlyData?.[monthlyData.length - 1]?.expenses || 0)) / 100)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
