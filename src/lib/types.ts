// Database types matching our Supabase schema

export interface Product {
  id: string
  name: string
  description: string | null
  category: string | null
  unit_price: number
  stock_quantity: number
  min_stock_level: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StockTransaction {
  id: string
  product_id: string
  transaction_type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string | null
  reference_number: string | null
  created_by: string | null
  created_at: string
}

export interface Patient {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  date_of_birth: string | null
  gender: string | null
  address: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  medical_history: string | null
  allergies: string | null
  created_at: string
  updated_at: string
}

export interface Treatment {
  id: string
  name: string
  description: string | null
  price_cents: number
  duration_minutes: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Visit {
  id: string
  patient_id: string
  visit_date: string
  visit_type: string
  status: string
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface VisitTreatment {
  id: string
  visit_id: string
  treatment_id: string
  quantity: number
  unit_price_cents: number
  notes: string | null
  created_at: string
}

export interface Bill {
  total_amount: number,
  patient_name: string
  id: string
  visit_id: string
  bill_number: string
  subtotal_cents: number
  tax_cents: number
  total_cents: number
  payment_status: 'pending' | 'paid' | 'overdue'
  payment_method: string | null
  payment_date: string | null
  pdf_url: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface BillItem {
  id: string
  bill_id: string
  treatment_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface RevenueEntry {
  id: string
  bill_id: string
  amount_cents: number
  revenue_date: string
  created_at: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  expense_date: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  bill_id: string
  notification_type: string
  recipient: string
  status: 'pending' | 'sent' | 'failed'
  sent_at: string | null
  error_message: string | null
  created_at: string
}

// Form types
export interface CreateProductData {
  name: string
  description?: string
  category?: string
  unit_price_cents: number
  stock_quantity: number
  min_stock_level?: number
}

export interface CreateStockTransactionData {
  product_id: string
  transaction_type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason?: string
  reference_number?: string
}

export interface CreatePatientData {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  date_of_birth?: string
  gender?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  medical_history?: string
  allergies?: string
}

export interface CreateTreatmentData {
  name: string
  description?: string
  price_cents: number
  duration_minutes?: number
}

export interface CreateExpenseData {
  description: string
  amount: number
  category: string
  expense_date: string
}
