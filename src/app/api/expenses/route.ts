import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CreateExpenseData } from '@/lib/types'

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
      .select('*')
      .order('expense_date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Temporarily disable authentication for debugging
    // const auth = authMiddleware(request)
    // if (auth instanceof NextResponse) return auth
    // if (!hasPermission(auth, Permission.WRITE_EXPENSES)) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

    const expenseData: CreateExpenseData = await request.json()

    const { data, error } = await supabase
      .from('expenses')
      .insert(expenseData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}
