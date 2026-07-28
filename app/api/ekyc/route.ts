import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// ponytail: mock e-KYC — ganti dengan panggilan API riil ke Verihubs / Nodeflux / Asli RI / GLAIR / Vida
// Hanya mengembalikan data untuk file yang hash-nya cocok dengan database test.
// Untuk file lain (non-KTP / KTP lain) → return error.

const ALLOWED = ['image/jpeg', 'image/png']
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png']
const MIN_FILE = 30 * 1024
const MAX_FILE = 10 * 1024 * 1024

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

// Tambahkan hash file KTP test di sini. Jalankan untuk mendapat hash:
//   node -e "crypto.createHash('sha256').update(require('fs').readFileSync('ktp.jpg').slice(0,65536)).digest('hex')"
const KTP_DB: Record<string, KTPData> = {
  // Test default — ganti dengan hash KTP asli setelah di-compute
  'dev': {
    nik: '3271063010020008',
    full_name: 'MUCHAMMAD ABDUROHIM',
    birth_place: 'BOGOR',
    birth_date: '2002-10-30',
    gender: 'LAKI-LAKI',
    address: 'KEDUNG BADAK NO 16',
    rt_rw: '008/002',
    kelurahan: 'KEDUNG BADAK',
    kecamatan: 'TANAH SAREAL',
    agama: 'ISLAM',
    nationality: 'WNI',
    valid_until: 'SEUMUR HIDUP',
  },
}

function fileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer.slice(0, 65536)).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ success: false, message: 'File tidak ditemukan' }, { status: 400 })
    }
    if (!ALLOWED.includes(file.type) || !ALLOWED_EXT.includes('.' + file.name.split('.').pop()!.toLowerCase())) {
      return NextResponse.json({ success: false, message: 'Gambar yang diunggah bukan KTP atau tidak terbaca dengan jelas.' }, { status: 400 })
    }
    if (file.size < MIN_FILE || file.size > MAX_FILE) {
      return NextResponse.json({ success: false, message: 'Gambar yang diunggah bukan KTP atau tidak terbaca dengan jelas.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const hash = fileHash(buffer)
    let data = KTP_DB[hash]

    if (!data && process.env.NODE_ENV === 'development' && /ktp/i.test(file.name)) {
      console.log('[e-KYC mock] KTP file detected, hash:', hash, '- add to KTP_DB for persistent matching')
      data = KTP_DB['dev']
    }

    if (!data) {
      return NextResponse.json({ success: false, message: 'Gambar yang diunggah bukan KTP atau tidak terbaca dengan jelas.' }, { status: 400 })
    }

    // Real implementation: kirim buffer ke vendor e-KYC, validasi response
    // const vendorRes = await fetch('https://api.verihubs.com/v1/ktp', {
    //   method: 'POST',
    //   headers: { 'API-Key': process.env.EKYC_API_KEY!, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ image: buffer.toString('base64') }),
    // })
    // const result = await vendorRes.json()
    // if (!result.isKTP || result.confidence_score < 0.80) {
    //   return NextResponse.json({ success: false, message: '...' }, { status: 400 })
    // }
    // return NextResponse.json({ success: true, data: result })

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, message: 'Gambar yang diunggah bukan KTP atau tidak terbaca dengan jelas.' }, { status: 400 })
  }
}