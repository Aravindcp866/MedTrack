import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching bills:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { visitId } = await request.json()
    
    if (!visitId) {
      return NextResponse.json(
        { error: 'Visit ID is required' },
        { status: 400 }
      )
    }

    // Get visit details with patient and treatments
    const { data: visit, error: visitError } = await supabase
      .from('visits')
      .select(`
        *,
        patient:patients(*),
        visit_treatments(
          *,
          treatment:treatments(*)
        )
      `)
      .eq('id', visitId)
      .single()

    if (visitError || !visit) {
      return NextResponse.json(
        { error: 'Visit not found' },
        { status: 404 }
      )
    }

    // Calculate totals
    let subtotal = 0
    const billItems = visit.visit_treatments.map((vt: { quantity: number; unit_price_cents: number; treatment: { name: string } }) => {
      const total = vt.quantity * vt.unit_price_cents
      subtotal += total
      return {
        treatment_name: vt.treatment.name,
        quantity: vt.quantity,
        unit_price_cents: vt.unit_price_cents,
        total_cents: total,
      }
    })

    const tax = Math.round(subtotal * 0.1) // 10% tax
    const total = subtotal + tax

    // Generate bill number
    const { data: billNumber } = await supabase.rpc('generate_bill_number')

    // Create bill
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .insert({
        visit_id: visitId,
        bill_number: billNumber,
        subtotal_cents: subtotal,
        tax_cents: tax,
        total_cents: total,
      })
      .select()
      .single()

    if (billError) throw billError

    // Create bill items
    const { error: itemsError } = await supabase
      .from('bill_items')
      .insert(
        billItems.map((item: { treatment_name: string; quantity: number; unit_price_cents: number; total_cents: number }) => ({
          bill_id: bill.id,
          ...item,
        }))
      )

    if (itemsError) throw itemsError

    return NextResponse.json(bill, { status: 201 })
  } catch (error) {
    console.error('Error creating bill:', error)
    return NextResponse.json(
      { error: 'Failed to create bill' },
      { status: 500 }
    )
  }
}
