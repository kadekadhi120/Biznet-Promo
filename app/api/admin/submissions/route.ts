import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

async function verifyAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null

  const serviceClient = createServiceClient()
  const { data } = await serviceClient
    .from('admins')
    .select('id')
    .eq('id', user.id)
    .single()

  return data ? user : null
}

// GET — daftar semua form submissions
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdmin()
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const status = searchParams.get('status') // 'pending' | 'success' | 'failed'
    const from = (page - 1) * limit
    const to = from + limit - 1

    const serviceClient = createServiceClient()
    let query = serviceClient
      .from('form_submissions')
      .select(
        'id, full_name, email, phone_number, selected_services, notion_sync_status, notion_sync_error, created_at',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status) {
      query = query.eq('notion_sync_status', status)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      meta: { total: count ?? 0, page, limit },
    })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
