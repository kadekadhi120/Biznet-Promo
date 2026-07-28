import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createNotionSubmission } from '@/lib/notion'
import { decrypt } from '@/lib/crypto'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verifikasi session admin
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Cek apakah user adalah admin
    const serviceClient = createServiceClient()
    const { data: adminData } = await serviceClient
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!adminData) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Ambil data submission
    const { data: submission, error: fetchError } = await serviceClient
      .from('form_submissions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !submission) {
      return NextResponse.json(
        { success: false, message: 'Submission tidak ditemukan' },
        { status: 404 }
      )
    }

    if (submission.notion_sync_status === 'success') {
      return NextResponse.json(
        { success: false, message: 'Submission sudah tersinkronisasi ke Notion' },
        { status: 400 }
      )
    }

    // Retry Notion sync
    let notionPageId: string | null = null
    let notionStatus: 'success' | 'failed' = 'failed'
    let notionError: string | null = null

    try {
      notionPageId = await createNotionSubmission({
        full_name: submission.full_name,
        nik: submission.nik,
        birth_date: submission.birth_date,
        phone_number: submission.phone_number,
        email: submission.email,
        selected_services: submission.selected_services,
        ktp_photo_url: submission.ktp_photo_url,
        installation_address: submission.installation_address || '',
        sharelock_link: submission.sharelock_link || '',
        front_house_photo_url: submission.front_house_photo_url || '',
        installation_date: submission.installation_date || '',
        promo: submission.promo || '',
      })
      notionStatus = 'success'
    } catch (err) {
      console.error('Notion retry error:', err)
      notionError = err instanceof Error ? err.message : String(err)
    }

    // Update status
    const { error: updateError } = await serviceClient
      .from('form_submissions')
      .update({
        notion_page_id: notionPageId,
        notion_sync_status: notionStatus,
        notion_sync_error: notionError,
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json(
        { success: false, message: 'Gagal update status sinkronisasi' },
        { status: 500 }
      )
    }

    if (notionStatus === 'success') {
      return NextResponse.json({ success: true, data: { notion_page_id: notionPageId } })
    } else {
      return NextResponse.json(
        { success: false, message: `Notion sync gagal: ${notionError}` },
        { status: 502 }
      )
    }
  } catch (err) {
    console.error('POST /api/admin/submissions/[id]/retry error:', err)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
