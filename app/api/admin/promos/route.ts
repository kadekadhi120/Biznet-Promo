import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { PromoInsert } from '@/lib/types'
import { isDevMode, MOCK_PROMOS } from '@/lib/mock-data'

async function verifyAdmin() {
  if (isDevMode()) return { id: 'mock-admin' }
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  const serviceClient = createServiceClient()
  const { data } = await serviceClient.from('admins').select('id').eq('id', user.id).single()
  return data ? user : null
}

export async function GET() {
  try {
    const user = await verifyAdmin()
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    if (isDevMode()) return NextResponse.json({ success: true, data: MOCK_PROMOS })

    const serviceClient = createServiceClient()
    const { data, error } = await serviceClient.from('promos').select('*').order('display_order', { ascending: true })
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdmin()
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    if (isDevMode()) {
      const body = await request.json() as PromoInsert
      console.log('📝 [DEV] Promo created:', body)
      return NextResponse.json({ success: true, data: { id: 'mock-' + Date.now(), ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } }, { status: 201 })
    }

    const body = await request.json() as PromoInsert
    const serviceClient = createServiceClient()
    const { data, error } = await serviceClient.from('promos').insert({ ...body, updated_by: user.id }).select().single()
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
