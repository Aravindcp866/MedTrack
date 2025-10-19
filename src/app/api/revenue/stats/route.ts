import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Temporarily disable authentication for debugging
    // const auth = authMiddleware(request)
    // if (auth instanceof NextResponse) return auth
    // if (!hasPermission(auth, Permission.READ_REVENUE)) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

    // Get current month date range
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const startDate = startOfMonth.toISOString().split('T')[0]
    const endDate = endOfMonth.toISOString().split('T')[0]

    // Get monthly revenue from paid bills (treatment fees)
    const { data: billsData, error: billsError } = await supabase
      .from('bills')
      .select('total_amount, created_at')
      .eq('status', 'paid')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    if (billsError) throw billsError

    // Get monthly revenue from inventory sales
    const { data: inventoryRevenue, error: inventoryError } = await supabase
      .from('revenue_entries')
      .select('amount')
      .eq('category', 'Inventory Sales')
      .gte('revenue_date', startDate)
      .lte('revenue_date', endDate)

    if (inventoryError) throw inventoryError

    // Calculate monthly revenue (treatment fees + inventory sales)
    const treatmentRevenue = (billsData || []).reduce((sum, bill) => {
      return sum + (Number(bill.total_amount) * 100) // Convert to cents
    }, 0)

    const inventoryRevenueAmount = (inventoryRevenue || []).reduce((sum, entry) => {
      return sum + (Number(entry.amount) * 100) // Convert to cents
    }, 0)

    const monthlyRevenue = treatmentRevenue + inventoryRevenueAmount

    // Calculate revenue growth (simplified - compare with previous month)
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const prevStartDate = prevMonthStart.toISOString().split('T')[0]
    const prevEndDate = prevMonthEnd.toISOString().split('T')[0]

    // Get previous month revenue from bills
    const { data: prevBillsData } = await supabase
      .from('bills')
      .select('total_amount')
      .eq('status', 'paid')
      .gte('created_at', prevStartDate)
      .lte('created_at', prevEndDate)

    // Get previous month inventory revenue
    const { data: prevInventoryRevenue } = await supabase
      .from('revenue_entries')
      .select('amount')
      .eq('category', 'Inventory Sales')
      .gte('revenue_date', prevStartDate)
      .lte('revenue_date', prevEndDate)

    const prevTreatmentRevenue = (prevBillsData || []).reduce((sum, bill) => {
      return sum + (Number(bill.total_amount) * 100) // Convert to cents
    }, 0)

    const prevInventoryRevenueAmount = (prevInventoryRevenue || []).reduce((sum, entry) => {
      return sum + (Number(entry.amount) * 100)
    }, 0)

    const prevMonthRevenue = prevTreatmentRevenue + prevInventoryRevenueAmount

    const revenueGrowth = prevMonthRevenue > 0 
      ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 
      : 0

    // Calculate weekly revenue for the current month
    const weeklyRevenue = []
    const weeksInMonth = Math.ceil(now.getDate() / 7)
    
    for (let week = 1; week <= weeksInMonth; week++) {
      const weekStart = new Date(now.getFullYear(), now.getMonth(), (week - 1) * 7 + 1)
      const weekEnd = new Date(now.getFullYear(), now.getMonth(), Math.min(week * 7, now.getDate()))
      
      const { data: weekBills } = await supabase
        .from('bills')
        .select('total_amount')
        .eq('status', 'paid')
        .gte('created_at', weekStart.toISOString().split('T')[0])
        .lte('created_at', weekEnd.toISOString().split('T')[0])

      const weekRevenue = (weekBills || []).reduce((sum, bill) => {
        return sum + (Number(bill.total_amount) * 100)
      }, 0)

      weeklyRevenue.push(weekRevenue)
    }

    // Get total patients count
    const { data: patientsCount } = await supabase
      .from('patients')
      .select('count', { count: 'exact' })

    // Calculate daily revenue for current month
    const dailyRevenue = []
    for (let day = 1; day <= now.getDate(); day++) {
      const dayDate = new Date(now.getFullYear(), now.getMonth(), day)
      const dayStart = dayDate.toISOString().split('T')[0]

      // Get bills for this day
      const { data: dayBills } = await supabase
        .from('bills')
        .select('total_amount')
        .eq('status', 'paid')
        .gte('created_at', dayStart)
        .lt('created_at', new Date(dayDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])

      // Get inventory sales for this day
      const { data: dayInventory } = await supabase
        .from('revenue_entries')
        .select('amount')
        .eq('category', 'Inventory Sales')
        .eq('revenue_date', dayStart)

      const dayTreatmentRevenue = (dayBills || []).reduce((sum, bill) => {
        return sum + (Number(bill.total_amount) * 100) // Convert to cents
      }, 0)

      const dayInventoryRevenue = (dayInventory || []).reduce((sum, entry) => {
        return sum + (Number(entry.amount) * 100)
      }, 0)

      dailyRevenue.push(dayTreatmentRevenue + dayInventoryRevenue)
    }

    return NextResponse.json({
      monthlyRevenue,
      revenueGrowth,
      totalRevenue: monthlyRevenue,
      weeklyRevenue,
      dailyRevenue,
      totalPatients: patientsCount?.[0]?.count || 0,
      treatmentRevenue,
      inventoryRevenue: inventoryRevenueAmount
    })
  } catch (error) {
    console.error('Error fetching revenue stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue stats' },
      { status: 500 }
    )
  }
}
