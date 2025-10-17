import { supabase } from '../supabase'
import { Product, CreateProductData, CreateStockTransactionData, StockTransaction } from '../types'

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createProduct(productData: CreateProductData): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(id: string, updates: Partial<CreateProductData>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getStockTransactions(productId?: string): Promise<StockTransaction[]> {
  let query = supabase
    .from('stock_transactions')
    .select('*')
    .order('created_at', { ascending: false })

  if (productId) {
    query = query.eq('product_id', productId)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function createStockTransaction(transactionData: CreateStockTransactionData): Promise<StockTransaction> {
  const { data, error } = await supabase
    .from('stock_transactions')
    .insert(transactionData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getLowStockProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')

  if (error) throw error
  
  // Filter low stock products in JavaScript since we can't use raw SQL
  const lowStockProducts = data?.filter(product => 
    product.stock_quantity <= product.min_stock_level
  ) || []
  
  return lowStockProducts
}
