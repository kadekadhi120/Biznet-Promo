import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png']
const MIN_FILE = 30 * 1024
const MAX_FILE = 10 * 1024 * 1024
const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

interface KTPData {
  nik: string
  full_name: string
  birth_place: string
  birth_date: string
  gender: string
  address: string
  rt_rw: string
  kelurahan: string
  kecamatan: string
  agama: string
  nationality: string
  valid_until: string
}

const PROMPT = `Extract the following fields from this Indonesian KTP (e-KTP) identity card image.
Return ONLY valid JSON with EXACTLY these keys (all strings):
- nik (16-digit number)
- full_name (full name, UPPERCASE as on card)
- birth_place (city of birth)
- birth_date (date format DD-MM-YYYY)
- gender (LAKI-LAKI or PEREMPUAN)
- address (street address)
- rt_rw (RT/RW number)
- kelurahan (village/kelurahan)
- kecamatan (district/kecamatan)
- agama (religion)
- nationality (kewarganegaraan)
- valid_until (masa berlaku, e.g. "SEUMUR HIDUP" or date)

If you cannot read the card clearly, return: {"error":"cannot read"}.`

function parseJSON(text: string): Record<string, string> | null {
  const first = text.indexOf('{')
  const last = text.lastIndexOf('}')
  if (first === -1 || last === -1) return null
  try { return JSON.parse(text.slice(first, last + 1)) } catch { return null }
}

function toKTPData(raw: Record<string, string>): KTPData | null {
  if (raw.error || !raw.nik || raw.nik.length !== 16 || !raw.full_name) return null
  return {
    nik: raw.nik,
    full_name: raw.full_name.toUpperCase(),
    birth_place: (raw.birth_place || '').toUpperCase(),
    birth_date: raw.birth_date || '',
    gender: (raw.gender || '').toUpperCase(),
    address: (raw.address || '').toUpperCase(),
    rt_rw: (raw.rt_rw || '').toUpperCase(),
    kelurahan: (raw.kelurahan || '').toUpperCase(),
    kecamatan: (raw.kecamatan || '').toUpperCase(),
    agama: (raw.agama || '').toUpperCase(),
    nationality: (raw.nationality || '').toUpperCase(),
    valid_until: (raw.valid_until || '').toUpperCase(),
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_GEMINI_KEY
  if (!apiKey) {
    return NextResponse.json({ success: false, message: 'GOOGLE_GEMINI_KEY belum diatur di .env' }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ success: false, message: 'File tidak ditemukan' }, { status: 400 })
    }
    const ext = '.' + file.name.split('.').pop()!.toLowerCase()
    if (!ALLOWED_EXT.includes(ext) || (file.type && !file.type.startsWith('image/'))) {
      return NextResponse.json({ success: false, message: 'Format file harus JPG/JPEG atau PNG' }, { status: 400 })
    }
    if (file.size < MIN_FILE || file.size > MAX_FILE) {
      return NextResponse.json({ success: false, message: 'Ukuran file tidak valid' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: PROMPT },
              { inline_data: { mime_type: file.type, data: base64 } },
            ],
          }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Gemini HTTP ${res.status}: ${err}`)
    }

    const geminiRes = await res.json()
    const text = geminiRes?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Gemini: response kosong')

    const parsed = parseJSON(text)
    if (!parsed) throw new Error('Gemini: JSON tidak valid')

    const data = toKTPData(parsed)
    if (!data) {
      return NextResponse.json({ success: false, message: 'Gambar yang diunggah bukan KTP atau tidak terbaca dengan jelas.' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Terjadi kesalahan'
    return NextResponse.json({ success: false, message: `Gagal membaca KTP: ${msg}` }, { status: 400 })
  }
}
