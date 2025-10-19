import { supabase } from '@/lib/supabase'

export interface BillItem {
  id: string
  bill_id: string
  product_id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  product?: {
    id: string
    name: string
    unit_price: number
    stock_quantity: number
  }
}

export interface CreateBillItemData {
  bill_id: string
  product_id: string
  description?: string
  quantity: number
  unit_price: number
  total_price: number
}

export async function getBillItems(billId: string): Promise<BillItem[]> {
  const { data, error } = await supabase
    .from('bill_items')
    .select(`
      *,
      product:products(
        id,
        name,
        unit_price,
        stock_quantity
      )
    `)
    .eq('bill_id', billId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createBillItem(itemData: CreateBillItemData): Promise<BillItem> {
  const { data, error } = await supabase
    .from('bill_items')
    .insert(itemData)
    .select(`
      *,
      product:products(
        id,
        name,
        unit_price,
        stock_quantity
      )
    `)
    .single()

  if (error) throw error
  return data
}

export async function updateBillItem(itemId: string, updates: Partial<CreateBillItemData>): Promise<BillItem> {
  const { data, error } = await supabase
    .from('bill_items')
    .update(updates)
    .eq('id', itemId)
    .select(`
      *,
      product:products(
        id,
        name,
        unit_price,
        stock_quantity
      )
    `)
    .single()

  if (error) throw error
  return data
}

export async function deleteBillItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('bill_items')
    .delete()
    .eq('id', itemId)

  if (error) throw error
}

export async function updateProductStock(productId: string, quantityChange: number): Promise<void> {
  // First try the RPC function
  const { error: rpcError } = await supabase.rpc('update_product_stock', {
    product_id: productId,
    quantity_change: quantityChange
  })

  // If RPC function doesn't exist, fall back to direct update
  if (rpcError && rpcError.code === 'PGRST202') {
    console.log('RPC function not found, using direct update...')
    
    // Get current stock
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .single()

    if (fetchError) throw fetchError

    // Update stock directly
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        stock_quantity: (product.stock_quantity || 0) + quantityChange,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)

    if (updateError) throw updateError
  } else if (rpcError) {
    throw rpcError
  }
}

export async function updateInventoryItem(productId: string, updates: {
  stockChange?: number;
  priceChange?: number;
  newPrice?: number;
}): Promise<void> {
  try {
    // Get current product data
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock_quantity, unit_price')
      .eq('id', productId)
      .single()

    if (fetchError) throw fetchError

    // Prepare update data
    const updateData: { updated_at: string; [key: string]: string | number } = {
      updated_at: new Date().toISOString()
    }

    // Update stock if needed
    if (updates.stockChange !== undefined) {
      updateData.stock_quantity = Math.max(0, (product.stock_quantity || 0) + updates.stockChange)
    }

    // Update price if needed
    if (updates.newPrice !== undefined) {
      updateData.unit_price = updates.newPrice // Store as dollars
    } else if (updates.priceChange !== undefined) {
      updateData.unit_price = Math.max(0, (product.unit_price || 0) + updates.priceChange)
    }

    // Update the product
    const { error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)

    if (updateError) throw updateError

    console.log(`Inventory updated for product ${productId}:`, updateData)
  } catch (error) {
    console.error('Error updating inventory item:', error)
    throw error
  }
}

