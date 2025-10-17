import { supabase } from '../supabase'
import { Expense, CreateExpenseData } from '../types'

export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getExpense(id: string): Promise<Expense | null> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createExpense(expenseData: CreateExpenseData): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expenseData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateExpense(id: string, updates: Partial<CreateExpenseData>): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getExpensesByCategory(startDate?: string, endDate?: string): Promise<{ category: string; total: number }[]> {
  let query = supabase
    .from('expenses')
    .select('category, amount')

  if (startDate) {
    query = query.gte('expense_date', startDate)
  }
  if (endDate) {
    query = query.lte('expense_date', endDate)
  }

  const { data, error } = await query

  if (error) throw error

  // Group by category and sum amounts
  const categoryTotals: { [key: string]: number } = {}
  data?.forEach(expense => {
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = 0
    }
    categoryTotals[expense.category] += (expense.amount * 100)
  })

  return Object.entries(categoryTotals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

export async function getMonthlyExpenses(months: number = 12): Promise<{ month: string; total: number }[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('amount, expense_date')
    .order('expense_date', { ascending: false })
    .limit(months * 31) // Approximate days in months

  if (error) throw error

  // Group by month
  const monthlyTotals: { [key: string]: number } = {}
  data?.forEach(expense => {
    const month = expense.expense_date.substring(0, 7) // YYYY-MM
    if (!monthlyTotals[month]) {
      monthlyTotals[month] = 0
    }
    monthlyTotals[month] += (expense.amount * 100)
  })

  return Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }))
}
