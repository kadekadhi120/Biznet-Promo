import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isDevMode, MOCK_PROMOS } from '@/lib/mock-data'

export const revalidate = 60

export async function GET() {
  if (isDevMode()) {
    return NextResponse.json(
      { success: true, data: MOCK_PROMOS.filter((p) => p.is_active) },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    )
  }

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('promos')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    )
  } catch (err) {
    console.error('GET /api/promos error:', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
