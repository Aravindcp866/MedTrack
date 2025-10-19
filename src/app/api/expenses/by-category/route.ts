import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Temporarily disable authentication for debugging
    // const auth = authMiddleware(request)
    // if (auth instanceof NextResponse) return auth
    // if (!hasPermission(auth, Permission.READ_EXPENSES)) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

    const { data, error } = await supabase
      .from('expenses')
      .select('category, amount')
      .order('category')

    if (error) throw error

    // Group by category and sum amounts
    const categoryTotals = (data || []).reduce((acc: Record<string, number>, expense) => {
      const category = expense.category || 'Other'
      acc[category] = (acc[category] || 0) + Number(expense.amount)
      return acc
    }, {})

    const result = Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total: total * 100 // Convert to cents for consistency
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching expenses by category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses by category' },
      { status: 500 }
    )
  }
}
