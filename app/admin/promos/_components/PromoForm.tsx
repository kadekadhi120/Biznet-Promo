'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Loader2, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Promo, PromoType } from '@/lib/types'

type PromoFormData = Omit<Promo, 'id' | 'created_at' | 'updated_at' | 'updated_by'>

interface PromoFormProps {
  initialData?: Promo
}

const defaultValues: PromoFormData = {
  name: '',
  price_monthly: 0,
  speed_mbps: 100,
  scheme_type: 'rent',
  fup_gb: null,
  free_extra_quota_gb: null,
  downgrade_speed_mbps: null,
  device_range: '',
  bandwidth_type: 'asymmetrical',
  ip_type: 'private',
  modem_rent_fee: 50000,
  installation_fee: 150000,
  ppn_percent: 11,
  badge_label: null,
  promo_type: 'normal',
  is_active: true,
  display_order: 0,
}

function Field({
  label,
  id,
  required,
  children,
}: {
  label: string
  id: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500" aria-label="wajib">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass = cn(
  'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800',
  'focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent',
  'transition-colors hover:border-slate-300'
)

export default function PromoForm({ initialData }: PromoFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<PromoFormData>(
    initialData
      ? {
          name: initialData.name,
          price_monthly: initialData.price_monthly,
          speed_mbps: initialData.speed_mbps,
          scheme_type: initialData.scheme_type,
          fup_gb: initialData.fup_gb,
          free_extra_quota_gb: initialData.free_extra_quota_gb,
          downgrade_speed_mbps: initialData.downgrade_speed_mbps,
          device_range: initialData.device_range,
          bandwidth_type: initialData.bandwidth_type,
          ip_type: initialData.ip_type,
          modem_rent_fee: initialData.modem_rent_fee,
          installation_fee: initialData.installation_fee,
          ppn_percent: initialData.ppn_percent,
          badge_label: initialData.badge_label,
          promo_type: initialData.promo_type,
          is_active: initialData.is_active,
          display_order: initialData.display_order,
        }
      : defaultValues
  )
  const [loading, setLoading] = useState(false)

  const set = <K extends keyof PromoFormData>(key: K, value: PromoFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || form.price_monthly <= 0) {
      toast.error('Nama paket dan harga wajib diisi.')
      return
    }

    setLoading(true)
    try {
      const url = initialData
        ? `/api/admin/promos/${initialData.id}`
        : '/api/admin/promos'
      const method = initialData ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()

      if (json.success) {
        toast.success(initialData ? 'Paket berhasil diperbarui.' : 'Paket berhasil dibuat.')
        router.push('/admin/promos')
        router.refresh()
      } else {
        toast.error(json.message || 'Gagal menyimpan paket.')
      }
    } catch {
      toast.error('Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Form paket promo">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Nama Paket */}
        <div className="md:col-span-2">
          <Field label="Nama Paket" id="name" required>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="cth. Home 1D 300Mbps"
              className={inputClass}
              required
            />
          </Field>
        </div>

        {/* Skema Modem */}
        <Field label="Skema Modem" id="scheme_type" required>
          <select
            id="scheme_type"
            value={form.scheme_type}
            onChange={(e) => set('scheme_type', e.target.value as 'rent' | 'buy')}
            className={inputClass}
          >
            <option value="rent">Sewa Modem</option>
            <option value="buy">Beli Modem</option>
          </select>
        </Field>

        {/* Tipe Promo */}
        <Field label="Tipe Promo" id="promo_type" required>
          <select
            id="promo_type"
            value={form.promo_type}
            onChange={(e) => set('promo_type', e.target.value as PromoType)}
            className={inputClass}
          >
            <option value="normal">Normal – Bayar 1 Bulan</option>
            <option value="diskon_3bln">Diskon – Bayar 3 Bulan</option>
            <option value="diskon_6bln">Diskon – Bayar 6 Bulan</option>
            <option value="diskon_12bln">Diskon – Bayar 12 Bulan</option>
          </select>
        </Field>

        {/* Harga/Bulan */}
        <Field label="Harga per Bulan (Rp)" id="price_monthly" required>
          <input
            id="price_monthly"
            type="number"
            min={0}
            value={form.price_monthly}
            onChange={(e) => set('price_monthly', Number(e.target.value))}
            className={inputClass}
            required
          />
        </Field>

        {/* Speed */}
        <Field label="Kecepatan (Mbps)" id="speed_mbps" required>
          <input
            id="speed_mbps"
            type="number"
            min={1}
            value={form.speed_mbps}
            onChange={(e) => set('speed_mbps', Number(e.target.value))}
            className={inputClass}
            required
          />
        </Field>

        {/* FUP */}
        <Field label="FUP (GB) — kosongkan jika unlimited" id="fup_gb">
          <input
            id="fup_gb"
            type="number"
            min={0}
            value={form.fup_gb ?? ''}
            onChange={(e) =>
              set('fup_gb', e.target.value === '' ? null : Number(e.target.value))
            }
            placeholder="Unlimited"
            className={inputClass}
          />
        </Field>

        {/* Extra Quota */}
        <Field label="Free Extra Quota (GB)" id="free_extra_quota_gb">
          <input
            id="free_extra_quota_gb"
            type="number"
            min={0}
            value={form.free_extra_quota_gb ?? ''}
            onChange={(e) =>
              set('free_extra_quota_gb', e.target.value === '' ? null : Number(e.target.value))
            }
            placeholder="0"
            className={inputClass}
          />
        </Field>

        {/* Downgrade Speed */}
        <Field label="Speed Setelah FUP (Mbps)" id="downgrade_speed_mbps">
          <input
            id="downgrade_speed_mbps"
            type="number"
            min={0}
            value={form.downgrade_speed_mbps ?? ''}
            onChange={(e) =>
              set('downgrade_speed_mbps', e.target.value === '' ? null : Number(e.target.value))
            }
            placeholder="10"
            className={inputClass}
          />
        </Field>

        {/* Device Range */}
        <Field label="Jumlah Device" id="device_range">
          <input
            id="device_range"
            type="text"
            value={form.device_range ?? ''}
            onChange={(e) => set('device_range', e.target.value || null)}
            placeholder="cth. 1-10"
            className={inputClass}
          />
        </Field>

        {/* Bandwidth Type */}
        <Field label="Tipe Bandwidth" id="bandwidth_type" required>
          <select
            id="bandwidth_type"
            value={form.bandwidth_type}
            onChange={(e) =>
              set('bandwidth_type', e.target.value as 'symmetrical' | 'asymmetrical')
            }
            className={inputClass}
          >
            <option value="asymmetrical">Asymmetrical</option>
            <option value="symmetrical">Symmetrical (Upload = Download)</option>
          </select>
        </Field>

        {/* IP Type */}
        <Field label="Tipe IP" id="ip_type" required>
          <select
            id="ip_type"
            value={form.ip_type}
            onChange={(e) => set('ip_type', e.target.value as 'private' | 'public')}
            className={inputClass}
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </Field>

        {/* Sewa Modem */}
        <Field label="Biaya Sewa Modem/Bulan (Rp)" id="modem_rent_fee">
          <input
            id="modem_rent_fee"
            type="number"
            min={0}
            value={form.modem_rent_fee}
            onChange={(e) => set('modem_rent_fee', Number(e.target.value))}
            className={inputClass}
          />
        </Field>

        {/* Instalasi */}
        <Field label="Biaya Instalasi (Rp)" id="installation_fee">
          <input
            id="installation_fee"
            type="number"
            min={0}
            value={form.installation_fee}
            onChange={(e) => set('installation_fee', Number(e.target.value))}
            className={inputClass}
          />
        </Field>

        {/* PPN */}
        <Field label="PPN (%)" id="ppn_percent">
          <input
            id="ppn_percent"
            type="number"
            min={0}
            max={100}
            value={form.ppn_percent}
            onChange={(e) => set('ppn_percent', Number(e.target.value))}
            className={inputClass}
          />
        </Field>

        {/* Badge Label */}
        <Field label="Badge Label (opsional)" id="badge_label">
          <input
            id="badge_label"
            type="text"
            value={form.badge_label ?? ''}
            onChange={(e) => set('badge_label', e.target.value || null)}
            placeholder="cth. Gamers Edition"
            className={inputClass}
          />
        </Field>

        {/* Display Order */}
        <Field label="Urutan Tampil" id="display_order">
          <input
            id="display_order"
            type="number"
            min={0}
            value={form.display_order}
            onChange={(e) => set('display_order', Number(e.target.value))}
            className={inputClass}
          />
        </Field>

        {/* Status Aktif */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => set('is_active', !form.is_active)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.is_active ? 'bg-sky-500' : 'bg-slate-200'
            }`}
            role="switch"
            aria-checked={form.is_active}
            aria-label="Status aktif paket"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                form.is_active ? 'translate-x-6' : 'translate-x-1'
              }`}
              aria-hidden="true"
            />
          </button>
          <span className="text-sm font-medium text-slate-700">
            {form.is_active ? 'Aktif (tampil di landing page)' : 'Nonaktif (tersembunyi)'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-300 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          aria-busy={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="w-4 h-4" aria-hidden="true" />
          )}
          {loading ? 'Menyimpan...' : 'Simpan Paket'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/promos')}
          className="text-slate-500 hover:text-slate-700 font-medium px-4 py-3 rounded-xl transition-colors"
        >
          Batal
        </button>
      </div>
    </form>
  )
}
