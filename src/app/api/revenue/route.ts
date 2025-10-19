import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Temporarily disable authentication for debugging
    // const auth = authMiddleware(request)
    // if (auth instanceof NextResponse) return auth
    // if (!hasPermission(auth, Permission.READ_REVENUE)) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

    const { data, error } = await supabase
      .from('revenue_entries')
      .select('*')
      .order('entry_date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching revenue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue' },
      { status: 500 }
    )
  }
}
