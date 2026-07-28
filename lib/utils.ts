import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format angka ke format Rupiah */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format tanggal ke format Indonesia */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString))
}

/** Truncate string dengan ellipsis */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '…'
}

/** Validasi format nomor HP Indonesia */
export function isValidIndonesianPhone(phone: string): boolean {
  return /^(\+62|62|0)[0-9]{8,13}$/.test(phone.replace(/[\s-]/g, ''))
}

/** Label promo yang ramah dibaca */
export const PROMO_LABELS: Record<string, string> = {
  normal: 'Normal – Bayar 1 Bulan',
  diskon_3bln: 'Diskon – Bayar 3 Bulan',
  diskon_6bln: 'Diskon – Bayar 6 Bulan',
  diskon_12bln: 'Diskon – Bayar 12 Bulan',
}

/** Label skema modem */
export const SCHEME_LABELS: Record<string, string> = {
  rent: 'Sewa Modem',
  buy: 'Beli Modem',
}
