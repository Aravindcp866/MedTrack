export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000) // Limit length
}

export function sanitizePatientData(data: Record<string, unknown>) {
  return {
    first_name: sanitizeInput(String(data.first_name || '')),
    last_name: sanitizeInput(String(data.last_name || '')),
    email: data.email ? sanitizeInput(String(data.email)) : null,
    phone: data.phone ? sanitizeInput(String(data.phone)) : null,
    date_of_birth: data.date_of_birth || null,
    gender: data.gender || null,
    address: data.address ? sanitizeInput(String(data.address)) : null,
    emergency_contact: data.emergency_contact ? sanitizeInput(String(data.emergency_contact)) : null,
    medical_history: data.medical_history ? sanitizeInput(String(data.medical_history)) : null,
    allergies: data.allergies ? sanitizeInput(String(data.allergies)) : null,
  }
}

export function sanitizeProductData(data: Record<string, unknown>) {
  return {
    name: sanitizeInput(String(data.name || '')),
    description: data.description ? sanitizeInput(String(data.description)) : null,
    category: data.category ? sanitizeInput(String(data.category)) : null,
    unit_price_cents: Math.max(0, Number(data.unit_price_cents) || 0),
    stock_quantity: Math.max(0, Number(data.stock_quantity) || 0),
    min_stock_level: Math.max(0, Number(data.min_stock_level) || 0),
  }
}

export function sanitizeExpenseData(data: Record<string, unknown>) {
  return {
    description: sanitizeInput(String(data.description || '')),
    amount: Math.max(0, Number(data.amount) || 0),
    category: sanitizeInput(String(data.category || '')),
    expense_date: data.expense_date || new Date().toISOString().split('T')[0],
  }
}
