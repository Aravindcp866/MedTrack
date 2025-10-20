'use client'

import { useQuery } from '@tanstack/react-query'
import { getRevenueStats, getMonthlyRevenueData, getFounderPayout } from '@/lib/api/revenue'
import { getExpensesByCategory } from '@/lib/api/expenses'
import { useCurrency } from '@/components/CurrencySettings'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { IndianRupeeIcon, TrendingUp, TrendingDown } from 'lucide-react'

export default function RevenuePage() {
  const { formatPrice } = useCurrency()

  // Get current month date range
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  const startDate = startOfMonth.toISOString().split('T')[0]
  const endDate = endOfMonth.toISOString().split('T')[0]

  // Fetch data
  const { data: revenueStats, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-stats', startDate, endDate],
    queryFn: () => getRevenueStats(startDate, endDate),
  })

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthly-revenue'],
    queryFn: () => getMonthlyRevenueData(12),
  })

  const { data: expensesByCategory, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses-by-category', startDate, endDate],
    queryFn: () => getExpensesByCategory(startDate, endDate),
  })

  const { data: founderPayout, isLoading: payoutLoading } = useQuery({
    queryKey: ['founder-payout', startDate, endDate],
    queryFn: () => getFounderPayout(startDate, endDate),
  })

  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`


  if (revenueLoading || monthlyLoading || expensesLoading || payoutLoading) {
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

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Revenue Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your clinic&apos;s financial performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <IndianRupeeIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice((revenueStats?.monthlyRevenue || 0) / 100)}
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

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <IndianRupeeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice((revenueStats?.totalRevenue || 0) / 100)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <IndianRupeeIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Previous Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice((revenueStats?.previousMonthRevenue || 0) / 100)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <IndianRupeeIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Founder Payout</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice((founderPayout || 0) / 100)}
              </p>
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
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Revenue Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueStats?.weeklyRevenue.map((amount, index) => ({
              week: `Week ${index + 1}`,
              revenue: amount
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis tickFormatter={(value) => `$${(value / 100).toFixed(0)}`} />
              <Tooltip formatter={(value) => [formatPrice(Number(value) / 100), 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses by Category */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expenses by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={expensesByCategory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis tickFormatter={(value) => formatPrice(Number(value) / 100)} />
            <Tooltip formatter={(value) => [formatPrice(Number(value) / 100), 'Amount']} />
            <Bar dataKey="total" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Expenses by Category Table */}
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Category Breakdown</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {expensesByCategory?.map((expense) => {
                  const total = expensesByCategory.reduce((sum, item) => sum + item.total, 0)
                  const percentage = total > 0 ? ((expense.total / total) * 100).toFixed(1) : 0
                  return (
                    <tr key={expense.category}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {expense.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatPrice(Number(expense.total) / 100)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {percentage}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className='text-2xl font-bold text-gray-900 dark:text-white'> {expensesByCategory && expensesByCategory.reduce((sum, item) => sum + item.total, 0) / 100} </div>
      </div>
    </div>
  )
}
