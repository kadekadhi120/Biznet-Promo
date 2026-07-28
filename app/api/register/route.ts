import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createNotionSubmission } from '@/lib/notion'
import { encrypt } from '@/lib/crypto'
import { isDevMode } from '@/lib/mock-data'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_MIME = ['image/jpeg', 'image/png']

async function uploadFile(
  supabase: ReturnType<typeof createServiceClient>,
  file: File,
  prefix: string,
  nik: string,
  bucket: string
): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const filePath = `${prefix}/${Date.now()}_${nik.slice(-4)}.${ext}`
  const arrayBuffer = await file.arrayBuffer()
  const fileBuffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileBuffer, { contentType: file.type, upsert: false })

  if (uploadError) throw new Error(`Upload ${prefix} gagal: ${uploadError.message}`)

  const { data: signedData } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 60 * 60 * 24 * 365)

  return signedData?.signedUrl || filePath
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const full_name = (formData.get('full_name') as string)?.trim()
    const nik = (formData.get('nik') as string)?.trim()
    const birth_date = (formData.get('birth_date') as string)?.trim()
    const phone_number = (formData.get('phone_number') as string)?.trim()
    const email = (formData.get('email') as string)?.trim()
    const selectedServicesRaw = formData.get('selected_services') as string
    const installation_address = (formData.get('installation_address') as string)?.trim()
    const sharelock_link = (formData.get('sharelock_link') as string)?.trim()
    const installation_date = (formData.get('installation_date') as string)?.trim()
    const promo = (formData.get('promo') as string)?.trim()
    const ktp_photo = formData.get('ktp_photo') as File | null
    const front_house_photo = formData.get('front_house_photo') as File | null

    if (!full_name || !nik || !birth_date || !phone_number || !email) {
      return NextResponse.json({ success: false, message: 'Semua field wajib diisi' }, { status: 400 })
    }
    if (!/^\d{16}$/.test(nik)) {
      return NextResponse.json({ success: false, message: 'NIK harus 16 digit angka' }, { status: 400 })
    }
    if (!ktp_photo || !(ktp_photo instanceof File)) {
      return NextResponse.json({ success: false, message: 'Foto KTP wajib diunggah' }, { status: 400 })
    }
    if (ktp_photo.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: 'Ukuran file KTP maksimal 5MB' }, { status: 400 })
    }
    if (!ALLOWED_MIME.includes(ktp_photo.type)) {
      return NextResponse.json({ success: false, message: 'Format file KTP harus JPG Atau PNG' }, { status: 400 })
    }
    if (!installation_address || installation_address.length < 10) {
      return NextResponse.json({ success: false, message: 'Alamat instalasi minimal 10 karakter' }, { status: 400 })
    }
    if (!installation_date) {
      return NextResponse.json({ success: false, message: 'Tanggal instalasi wajib diisi' }, { status: 400 })
    }

    if (front_house_photo && front_house_photo instanceof File) {
      if (front_house_photo.size > MAX_FILE_SIZE) {
        return NextResponse.json({ success: false, message: 'Ukuran foto rumah maksimal 5MB' }, { status: 400 })
      }
      if (!ALLOWED_MIME.includes(front_house_photo.type)) {
        return NextResponse.json({ success: false, message: 'Format foto rumah harus JPG Atau PNG' }, { status: 400 })
      }
    }

    let selected_services: string[] = []
    try { selected_services = JSON.parse(selectedServicesRaw || '[]') } catch { selected_services = [] }

    // Dev mode: log & return success tanpa Supabase
    if (isDevMode()) {
      console.log('📝 [DEV] Pendaftaran baru:', { full_name, nik, email, phone_number, installation_address, selected_services, installation_date, promo })
      return NextResponse.json({ success: true, data: { id: 'dev-' + Date.now() } })
    }

    const supabase = createServiceClient()
    const bucket = process.env.SUPABASE_KTP_BUCKET || 'ktp-uploads'

    const ktp_photo_url = await uploadFile(supabase, ktp_photo, 'ktp', nik, bucket)

    let front_house_photo_url = ''
    if (front_house_photo && front_house_photo instanceof File) {
      front_house_photo_url = await uploadFile(supabase, front_house_photo, 'rumah', nik, bucket)
    }

    const encryptedNik = encrypt(nik)
    const { data: submission, error: dbError } = await supabase
      .from('form_submissions')
      .insert({
        ktp_photo_url, full_name, nik: encryptedNik, birth_date, phone_number, email,
        selected_services, installation_address, sharelock_link: sharelock_link || '',
        front_house_photo_url, installation_date, promo: promo || '', notion_sync_status: 'pending',
      })
      .select('id')
      .single()

    if (dbError || !submission) {
      console.error('DB insert error:', dbError)
      return NextResponse.json({ success: false, message: 'Gagal menyimpan data. Silakan coba lagi.' }, { status: 500 })
    }

    let notionPageId: string | null = null
    let notionStatus: 'success' | 'failed' = 'failed'
    let notionError: string | null = null

    try {
      notionPageId = await createNotionSubmission({
        full_name, nik, birth_date, phone_number, email, selected_services, ktp_photo_url,
        installation_address, sharelock_link: sharelock_link || '', front_house_photo_url,
        installation_date, promo: promo || '',
      })
      notionStatus = 'success'
    } catch (err) {
      console.error('Notion API error:', err)
      notionError = err instanceof Error ? err.message : String(err)
    }

    await supabase
      .from('form_submissions')
      .update({ notion_page_id: notionPageId, notion_sync_status: notionStatus, notion_sync_error: notionError })
      .eq('id', submission.id)

    return NextResponse.json({ success: true, data: { id: submission.id }, _notion_synced: notionStatus === 'success' })
  } catch (err) {
    console.error('POST /api/register unexpected error:', err)
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan pada server.' }, { status: 500 })
  }
}
