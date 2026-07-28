import { NextRequest, NextResponse } from 'next/server'

// ponytail: mock e-KYC — ganti dengan panggilan API riil ke Verihubs / Nodeflux / Asli RI / GLAIR / Vida
// Response format mengikuti standar industri identity verification

const MOCK_OK = {
  success: true,
  data: {
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ success: false, message: 'File tidak ditemukan' }, { status: 400 })
    }

    // Real implementation: kirim file ke API vendor e-KYC, parse response-nya
    // Contoh panggilan:
    // const vendorRes = await fetch('https://api.verihubs.com/v1/ktp', {
    //   method: 'POST',
    //   headers: { 'API-Key': process.env.EKYC_API_KEY!, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ image: buffer.toString('base64') }),
    // })
    // const data = await vendorRes.json()

    return NextResponse.json(MOCK_OK)
  } catch {
    return NextResponse.json({ success: false, message: 'Gagal memproses KTP' }, { status: 500 })
  }
}