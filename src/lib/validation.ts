import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

export const patientSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number').optional().or(z.literal('')),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().max(200, 'Address too long').optional().or(z.literal('')),
  emergency_contact: z.string().max(100, 'Emergency contact too long').optional().or(z.literal('')),
  medical_history: z.string().max(1000, 'Medical history too long').optional().or(z.literal('')),
  allergies: z.string().max(500, 'Allergies too long').optional().or(z.literal('')),
})

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional().or(z.literal('')),
  category: z.string().max(50, 'Category too long').optional().or(z.literal('')),
  unit_price_cents: z.number().min(0, 'Price must be positive'),
  stock_quantity: z.number().min(0, 'Stock must be non-negative'),
  min_stock_level: z.number().min(0, 'Min stock must be non-negative').optional(),
})

export const expenseSchema = z.object({
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  amount: z.number().min(0, 'Amount must be positive'),
  category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
})

export const billSchema = z.object({
  visitId: z.string().uuid('Invalid visit ID format'),
})

export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<{ data: T | null; error: NextResponse | null }> => {
    try {
      const body = await request.json()
      const validatedData = schema.parse(body)
      return { data: validatedData, error: null }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          data: null, 
          error: NextResponse.json({ 
            error: 'Validation failed', 
            details: error.issues 
          }, { status: 400 })
        }
      }
      return { 
        data: null, 
        error: NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
      }
    }
  }
}
