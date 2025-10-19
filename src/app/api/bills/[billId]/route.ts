import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ billId: string }> }
) {
  try {
    const { billId } = await params
    const { total_amount } = await request.json()

    const { data, error } = await supabase
      .from('bills')
      .update({ total_amount })
      .eq('id', billId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating bill:', error)
    return NextResponse.json(
      { error: 'Failed to update bill' },
      { status: 500 }
    )
  }
}
