import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CreateProductData } from '@/lib/types'
import { authMiddleware } from '@/middleware/auth'
import { Permission, hasPermission } from '@/lib/permissions'

export async function GET() {
  try {
    // Temporarily disable authentication for debugging
    // const auth = authMiddleware(request)
    // if (auth instanceof NextResponse) return auth
    // if (!hasPermission(auth, Permission.READ_INVENTORY)) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name')

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authMiddleware(request)
    if (auth instanceof NextResponse) return auth

    if (!hasPermission(auth, Permission.WRITE_INVENTORY)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const productData: CreateProductData = await request.json()
    
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
