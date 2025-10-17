import { supabase } from '../supabase'
import { Bill, BillItem, Patient, Visit } from '../types'

export async function getBills(): Promise<Bill[]> {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getBill(id: string): Promise<Bill | null> {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getBillItems(billId: string): Promise<BillItem[]> {
  const { data, error } = await supabase
    .from('bill_items')
    .select('*')
    .eq('bill_id', billId)

  if (error) throw error
  return data || []
}

export async function createBill(visitId: string): Promise<Bill> {
  // Get visit details with patient and treatments
  const { data: visit } = await supabase
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

  if (!visit) throw new Error('Visit not found')

  // Calculate totals
  let subtotal = 0
    const billItems = (visit.visit_treatments as { quantity: number; unit_price_cents: number; treatment: { name: string } }[]).map((vt) => {
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
      billItems.map(item => ({
        bill_id: bill.id,
        ...item,
      }))
    )

  if (itemsError) throw itemsError

  return bill
}

export async function updateBillPayment(
  billId: string, 
  paymentStatus: 'paid' | 'pending' | 'overdue',
  paymentMethod?: string
): Promise<Bill> {
  const updates: Record<string, string> = { payment_status: paymentStatus }
  
  if (paymentStatus === 'paid') {
    updates.payment_date = new Date().toISOString()
    if (paymentMethod) {
      updates.payment_method = paymentMethod
    }
  }

  const { data, error } = await supabase
    .from('bills')
    .update(updates)
    .eq('id', billId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function generateBillPDF(billId: string): Promise<string> {
  // This will be implemented in the API route
  const response = await fetch(`/api/bills/${billId}/pdf`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to generate PDF')
  }

  const { pdfUrl } = await response.json()
  return pdfUrl
}

export async function sendBillNotification(billId: string): Promise<void> {
  const response = await fetch(`/api/bills/${billId}/send`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to send notification')
  }
}

export async function getBillWithDetails(billId: string): Promise<{
  bill: Bill
  patient: Patient
  visit: Visit
  items: BillItem[]
}> {
  const { data, error } = await supabase
    .from('bills')
    .select(`
      *,
      visit:visits(
        *,
        patient:patients(*)
      ),
      bill_items(*)
    `)
    .eq('id', billId)
    .single()

  if (error) throw error

  return {
    bill: data as Bill,
    patient: (data as { visit: { patient: Patient } }).visit.patient,
    visit: (data as { visit: Visit }).visit,
    items: (data as { bill_items: BillItem[] }).bill_items,
  }
}
