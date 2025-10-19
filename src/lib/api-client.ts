// API client with authentication
const API_BASE_URL = ''

function getAuthHeaders() {
  // Temporarily disable authentication for debugging
  // const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return {
    'Content-Type': 'application/json',
    // ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }))
    const errorObj = new Error(error.error || `HTTP ${response.status}`)
    // Preserve the full error object
    Object.assign(errorObj, error)
    throw errorObj
  }

  return response.json()
}

// API methods
export const api = {
  // Patients
  getPatients: () => apiRequest<Patient[]>('/api/patients'),
  getPatient: (id: string) => apiRequest<Patient>(`/api/patients/${id}`),
  createPatient: (data: CreatePatientData) => 
    apiRequest<Patient>('/api/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePatient: (id: string, data: Partial<CreatePatientData>) =>
    apiRequest<Patient>(`/api/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePatient: (id: string) =>
    apiRequest<void>(`/api/patients/${id}`, {
      method: 'DELETE',
    }),

  // Products
  getProducts: () => apiRequest<Product[]>('/api/products'),
  getProduct: (id: string) => apiRequest<Product>(`/api/products/${id}`),
  createProduct: (data: CreateProductData) =>
    apiRequest<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProduct: (id: string, data: Partial<CreateProductData>) =>
    apiRequest<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: string) =>
    apiRequest<void>(`/api/products/${id}`, {
      method: 'DELETE',
    }),

  // Bills
  getBills: () => apiRequest<Bill[]>('/api/bills'),
  getBill: (id: string) => apiRequest<Bill>(`/api/bills/${id}`),
  createBill: (data: { visitId: string }) =>
    apiRequest<Bill>('/api/bills', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Expenses
  getExpenses: () => apiRequest<Expense[]>('/api/expenses'),
  getExpense: (id: string) => apiRequest<Expense>(`/api/expenses/${id}`),
  createExpense: (data: CreateExpenseData) =>
    apiRequest<Expense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateExpense: (id: string, data: Partial<CreateExpenseData>) =>
    apiRequest<Expense>(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteExpense: (id: string) =>
    apiRequest<void>(`/api/expenses/${id}`, {
      method: 'DELETE',
    }),

  // Revenue
  getRevenue: () => apiRequest<RevenueEntry[]>('/api/revenue'),
  getRevenueByMonth: () => apiRequest<{ month: string; revenue: number; expenses: number }[]>('/api/revenue/monthly'),
  getRevenueStats: () => apiRequest<{ monthlyRevenue: number; totalPatients: number; treatmentRevenue: number; inventoryRevenue: number; revenueGrowth: number; weeklyRevenue: number[]; dailyRevenue: number[] }>('/api/revenue/stats'),

  // Bills

  // Expenses by category
  getExpensesByCategory: () => apiRequest<{ category: string; total: number }[]>('/api/expenses/by-category'),

  // Visits
  getVisits: () => apiRequest<{ id: string; patient_id: string; visit_date: string; visit_type: string; status: string; treatment_notes: string; patient: { first_name: string; last_name: string; phone: string } }[]>('/api/visits'),
  createVisit: (data: { patient_id: string; visit_date: string; visit_type: string; status: string; treatment_notes: string; amount?: number }) => apiRequest<{ id: string; patient_id: string }>('/api/visits', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
}

// Import types
import { Patient, CreatePatientData, Product, CreateProductData, Bill, Expense, CreateExpenseData, RevenueEntry } from './types'
