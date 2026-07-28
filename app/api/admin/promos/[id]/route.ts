import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { PromoUpdate } from '@/lib/types'

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

// PATCH — update sebagian field promo
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAdmin()
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json() as PromoUpdate
    const serviceClient = createServiceClient()

    const { data, error } = await serviceClient
      .from('promos')
      .update({ ...body, updated_by: user.id })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — hapus promo
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAdmin()
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const serviceClient = createServiceClient()

    const { error } = await serviceClient
      .from('promos')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: null })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
