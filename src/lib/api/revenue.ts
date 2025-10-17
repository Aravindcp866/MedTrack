import { supabase } from '../supabase'
import { RevenueEntry } from '../types'

export interface RevenueStats {
  totalRevenue: number
  monthlyRevenue: number
  previousMonthRevenue: number
  weeklyRevenue: number[]
  revenueGrowth: number
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  expenses: number
  netRevenue: number
  founderPayout: number
}

export async function getRevenueStats(startDate: string, endDate: string): Promise<RevenueStats> {
  // Get current period revenue
  const { data: currentRevenue } = await supabase
    .from('revenue_entries')
    .select('amount')
    .gte('revenue_date', startDate)
    .lte('revenue_date', endDate)

  const totalRevenue = currentRevenue?.reduce((sum, entry) => sum + (entry.amount * 100), 0) || 0

  // Get previous month for comparison
  const prevStartDate = new Date(startDate)
  prevStartDate.setMonth(prevStartDate.getMonth() - 1)
  const prevEndDate = new Date(endDate)
  prevEndDate.setMonth(prevEndDate.getMonth() - 1)

  const { data: previousRevenue } = await supabase
    .from('revenue_entries')
    .select('amount')
    .gte('revenue_date', prevStartDate.toISOString().split('T')[0])
    .lte('revenue_date', prevEndDate.toISOString().split('T')[0])

  const previousMonthRevenue = previousRevenue?.reduce((sum, entry) => sum + (entry.amount * 100), 0) || 0

  // Calculate growth percentage
  const revenueGrowth = previousMonthRevenue > 0 
    ? ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
    : 0

  // Get weekly breakdown (last 4 weeks)
  const weeklyRevenue = []
  const currentDate = new Date(endDate)
  
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(currentDate)
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const { data: weekRevenue } = await supabase
      .from('revenue_entries')
      .select('amount')
      .gte('revenue_date', weekStart.toISOString().split('T')[0])
      .lte('revenue_date', weekEnd.toISOString().split('T')[0])

    const weekTotal = weekRevenue?.reduce((sum, entry) => sum + (entry.amount * 100), 0) || 0
    weeklyRevenue.push(weekTotal)
  }

  return {
    totalRevenue,
    monthlyRevenue: totalRevenue,
    previousMonthRevenue,
    weeklyRevenue,
    revenueGrowth,
  }
}

export async function getMonthlyRevenueData(months: number = 12): Promise<MonthlyRevenue[]> {
  const { data: revenueData } = await supabase
    .from('revenue_entries')
    .select('amount, revenue_date')
    .order('revenue_date', { ascending: false })
    .limit(months * 31) // Approximate days in months

  const { data: expenseData } = await supabase
    .from('expenses')
    .select('amount, expense_date')
    .order('expense_date', { ascending: false })
    .limit(months * 31)

  // Group by month
  const monthlyData: { [key: string]: { revenue: number; expenses: number } } = {}

  revenueData?.forEach(entry => {
    const month = entry.revenue_date.substring(0, 7) // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { revenue: 0, expenses: 0 }
    }
    monthlyData[month].revenue += (entry.amount * 100)
  })

  expenseData?.forEach(entry => {
    const month = entry.expense_date.substring(0, 7) // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { revenue: 0, expenses: 0 }
    }
    monthlyData[month].expenses += (entry.amount * 100)
  })

  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      revenue: data.revenue,
      expenses: data.expenses,
      netRevenue: data.revenue - data.expenses,
      founderPayout: Math.round((data.revenue - data.expenses) * 0.20), // 20% of net revenue
    }))
}

export async function getFounderPayout(startDate: string, endDate: string): Promise<number> {
  const { data } = await supabase.rpc('calculate_founder_payout', {
    start_date: startDate,
    end_date: endDate
  })

  return data || 0
}

export async function getRevenueEntries(startDate?: string, endDate?: string): Promise<RevenueEntry[]> {
  let query = supabase
    .from('revenue_entries')
    .select('*')
    .order('revenue_date', { ascending: false })

  if (startDate) {
    query = query.gte('revenue_date', startDate)
  }
  if (endDate) {
    query = query.lte('revenue_date', endDate)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}
