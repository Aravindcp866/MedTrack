'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getExpenses, createExpense, deleteExpense, getExpensesByCategory } from '@/lib/api/expenses'
import { getRevenueStats } from '@/lib/api/revenue'
import { CreateExpenseData } from '@/lib/types'
import { useCurrency } from '@/components/CurrencySettings'
import { ToastContainer, useToast } from '@/components/ui/Toast'
import { Plus, IndianRupee , Tag, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ExpensesPage() {
  const { formatPrice } = useCurrency()
  const { toasts, success, error, removeToast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newExpense, setNewExpense] = useState<CreateExpenseData>({
    description: '',
    amount: 0,
    category: '',
    expense_date: new Date().toISOString().split('T')[0],
  })

  const queryClient = useQueryClient()

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
  })

  const { data: expensesByCategory } = useQuery({
    queryKey: ['expenses-by-category'],
    queryFn: () => getExpensesByCategory(),
  })

  // Get current month date range for revenue
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const startDate = startOfMonth.toISOString().split('T')[0]
  const endDate = endOfMonth.toISOString().split('T')[0]

  const { data: revenueStats } = useQuery({
    queryKey: ['revenue-stats', startDate, endDate],
    queryFn: () => getRevenueStats(startDate, endDate),
  })

  const createExpenseMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: (data) => {
      console.log('Expense created successfully:', data)
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expenses-by-category'] })
      setShowAddForm(false)
      setNewExpense({
        description: '',
        amount: 0,
        category: '',
        expense_date: new Date().toISOString().split('T')[0],
      })
      success('Expense Added', 'The expense has been successfully added.')
    },
    onError: (err: Error) => {
      console.error('Error creating expense:', err)
      error('Failed to Add Expense', err.message || 'An error occurred while adding the expense.')
    },
  })

  const deleteExpenseMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expenses-by-category'] })
      success('Expense Deleted', 'The expense has been successfully deleted.')
    },
    onError: (err: Error) => {
      console.error('Error deleting expense:', err)
      error('Failed to Delete Expense', err.message || 'An error occurred while deleting the expense.')
    },
  })

  const handleDelete = (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      deleteExpenseMutation.mutate(expenseId)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting expense:', newExpense)
    
    // Validate required fields
    if (!newExpense.description.trim()) {
      error('Validation Error', 'Description is required.')
      return
    }
    if (!newExpense.category) {
      error('Validation Error', 'Category is required.')
      return
    }
    if (newExpense.amount <= 0) {
      error('Validation Error', 'Amount must be greater than 0.')
      return
    }
    
    createExpenseMutation.mutate(newExpense)
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

  const categories = [
    'rent', 'utilities', 'staff', 'equipment', 'supplies', 
    'insurance', 'marketing', 'maintenance', 'other'
  ]

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </button>
      </div>

      {/* Expense Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <IndianRupee  className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <IndianRupee  className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(
                  expenses?.filter(expense => {
                    const expenseDate = new Date(expense.expense_date)
                    const now = new Date()
                    return expenseDate.getMonth() === now.getMonth() && 
                           expenseDate.getFullYear() === now.getFullYear()
                  }).reduce((sum, expense) => sum + expense.amount, 0) || 0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IndianRupee  className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average per Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(
                  expenses && expenses.length > 0 ? 
                  expenses.reduce((sum, expense) => sum + expense.amount, 0) / Math.max(1, new Set(expenses.map(e => e.expense_date.split('-').slice(0, 2).join('-'))).size) : 0
                )}
              </p>
            </div>
          </div>
        </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <IndianRupee  className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(
                    ((revenueStats?.monthlyRevenue || 0) / 100) - 
                    (expenses?.filter(expense => {
                      const expenseDate = new Date(expense.expense_date)
                      const now = new Date()
                      return expenseDate.getMonth() === now.getMonth() &&
                            expenseDate.getFullYear() === now.getFullYear()
                    }).reduce((sum, expense) => sum + expense.amount, 0) || 0)
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Revenue - Expenses = Net Profit
                </p>
              </div>
            </div>
          </div>
      </div>

      {/* Expenses Chart */}
      {expensesByCategory && expensesByCategory.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Expenses by Category
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis tickFormatter={(value) => formatPrice(Number(value) / 100)} />
                <Tooltip 
                  formatter={(value) => [formatPrice(Number(value) / 100), 'Amount']}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <Bar dataKey="total" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  value={newExpense.amount || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  value={newExpense.expense_date}
                  onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createExpenseMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {createExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Expenses</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses?.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <IndianRupee  className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 capitalize">{expense.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(expense.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(expense.expense_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-600 hover:text-red-900 cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
