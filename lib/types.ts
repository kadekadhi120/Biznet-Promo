// ============================================================
// Data Models — sesuai PRD Bagian 8 (Data Model)
// ============================================================

export type SchemeType = 'rent' | 'buy'
export type BandwidthType = 'symmetrical' | 'asymmetrical'
export type IpType = 'private' | 'public'
export type PromoType = 'normal' | 'diskon_3bln' | 'diskon_6bln' | 'diskon_12bln'
export type NotionSyncStatus = 'pending' | 'success' | 'failed'

// ── Promo / Paket ──────────────────────────────────────────
export interface Promo {
  id: string
  name: string
  price_monthly: number
  speed_mbps: number
  scheme_type: SchemeType
  fup_gb: number | null
  free_extra_quota_gb: number | null
  downgrade_speed_mbps: number | null
  device_range: string | null
  bandwidth_type: BandwidthType
  ip_type: IpType
  modem_rent_fee: number
  installation_fee: number
  ppn_percent: number
  badge_label: string | null
  promo_type: PromoType
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
  updated_by: string | null
}

export type PromoInsert = Omit<Promo, 'id' | 'created_at' | 'updated_at'>
export type PromoUpdate = Partial<PromoInsert>

// ── Form Submission ────────────────────────────────────────
export interface FormSubmission {
  id: string
  ktp_photo_url: string
  full_name: string
  nik: string
  birth_date: string
  phone_number: string
  email: string
  selected_services: string[]
  installation_address: string
  sharelock_link: string
  front_house_photo_url: string
  installation_date: string | null
  promo: string
  notion_page_id: string | null
  notion_sync_status: NotionSyncStatus
  notion_sync_error: string | null
  created_at: string
}

// ── Admin ──────────────────────────────────────────────────
export interface Admin {
  id: string
  full_name: string
  role: 'admin'
  created_at: string
}

// ── Kalkulasi Biaya (computed, bukan dari DB) ──────────────
export interface CostBreakdown {
  biaya_paket: number
  sewa_modem: number
  biaya_instalasi: number
  ppn_amount: number
  total: number
}

export function calculateCost(promo: Promo): CostBreakdown {
  const biaya_paket = promo.price_monthly
  const sewa_modem = promo.scheme_type === 'rent' ? promo.modem_rent_fee : 0
  const biaya_instalasi = promo.installation_fee
  const subtotal = biaya_paket + sewa_modem + biaya_instalasi
  const ppn_amount = Math.round((subtotal * promo.ppn_percent) / 100)
  const total = subtotal + ppn_amount
  return { biaya_paket, sewa_modem, biaya_instalasi, ppn_amount, total }
}

// ── API Response shapes ────────────────────────────────────
export interface ApiSuccess<T = unknown> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  message: string
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

// ── Form Registrasi Zod schema types ──────────────────────
export interface RegistrationFormData {
  full_name: string
  nik: string
  birth_date: string
  phone_number: string
  email: string
  selected_services: string[]
  installation_address: string
  sharelock_link: string
  installation_date: string
  promo: string
  ktp_photo: FileList
}
