'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  User,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  Upload,
  CheckCircle,
  Loader2,
  X,
  MapPin,
  Link as LinkIcon,
  Wifi,
  Tag,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Promo } from '@/lib/types'

const schema = z.object({
  full_name: z.string().min(3, 'Nama minimal 3 karakter').max(100),
  nik: z
    .string()
    .length(16, 'NIK harus 16 digit')
    .regex(/^\d{16}$/, 'NIK hanya boleh berisi angka'),
  birth_date: z.string().min(1, 'Tanggal lahir wajib diisi'),
  phone_number: z
    .string()
    .regex(
      /^(\+62|62|0)[0-9]{8,13}$/,
      'Format No. HP tidak valid (contoh: 08123456789)'
    ),
  email: z.string().email('Format email tidak valid'),
  selected_service: z.string().min(1, 'Pilih layanan/paket'),
  installation_address: z.string().min(10, 'Alamat minimal 10 karakter').max(500),
  sharelock_link: z.string().url('Link tidak valid').or(z.literal('')),
  installation_date: z.string().min(1, 'Tanggal instalasi wajib diisi'),
  promo: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface RegistrationFormProps {
  promos: Promo[]
}

export default function RegistrationForm({ promos }: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [ktpFile, setKtpFile] = useState<File | null>(null)
  const [ktpError, setKtpError] = useState('')
  const [ktpPreview, setKtpPreview] = useState<string | null>(null)
  const [rumahFile, setRumahFile] = useState<File | null>(null)
  const [rumahError, setRumahError] = useState('')
  const [rumahPreview, setRumahPreview] = useState<string | null>(null)
  const ktpInputRef = useRef<HTMLInputElement>(null)
  const rumahInputRef = useRef<HTMLInputElement>(null)
  const [isOcrLoading, setIsOcrLoading] = useState(false)
  const [nikParsed, setNikParsed] = useState(false)
  const [showOcrConfirm, setShowOcrConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { selected_service: '', sharelock_link: '', promo: '' },
  })

  const selectedService = watch('selected_service')

  useEffect(() => {
    const handler = (e: CustomEvent<string>) => {
      setValue('selected_service', e.detail, { shouldValidate: true })
      setTimeout(() => {
        document.getElementById('selected_service')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        document.getElementById('selected_service')?.focus()
      }, 500)
    }
    window.addEventListener('selectPromo', handler as EventListener)
    return () => window.removeEventListener('selectPromo', handler as EventListener)
  }, [setValue])

  function parseNikDate(nik: string): string | null {
    const mid = nik.slice(6, 12)
    let dd = Number(mid.slice(0, 2))
    const mm = mid.slice(2, 4)
    const yy = mid.slice(4, 6)
    if (dd > 40) dd -= 40
    if (dd < 1 || dd > 31) return null
    if (Number(mm) < 1 || Number(mm) > 12) return null
    const fullYy = Number(yy) > new Date().getFullYear() % 100 ? 1900 + Number(yy) : 2000 + Number(yy)
    return `${fullYy}-${mm}-${String(dd).padStart(2, '0')}`
  }

  function parseKTPText(text: string): { nik: string; full_name: string; birth_place: string; birth_date: string } | null {
    let nik = ''
    const m16 = text.match(/\b\d{16}\b/)
    if (m16) nik = m16[0]
    if (!nik) {
      const fuzzy = text.replace(/[?OoIl|!]/g, '').match(/\d{16}/)
      if (fuzzy) nik = fuzzy[0]
    }
    if (!nik) return null

    let full_name = '', birth_place = '', birth_date = ''

    nameLoop:
    for (const line of text.split('\n')) {
      const t = line.trim()
      if (!full_name) {
        for (const sep of [':', '*', ':', '=']) {
          const m = t.match(new RegExp(`^nama\\s*[${sep}]\\s*(.+)`, 'i'))
          if (m) { full_name = m[1].replace(/[^A-Za-z\s.]/g, '').trim(); break nameLoop }
        }
        const m = t.match(/^[hn]ama\s*[:\s]\s*(.+)/i)
        if (m) full_name = m[1].replace(/[^A-Za-z\s]/g, '').split(/\s+/).filter(w => w.length > 2 || /^[A-Z]/.test(w)).join(' ')
      }
    }

    for (const line of text.split('\n')) {
      const t = line.trim()
      const m = t.match(/^temp\w*\s*\w*lahir\s*(.+)/i)
      if (m) {
        const raw = m[1].trim()
        const bd = raw.match(/(\d{1,2})\s*[-.\/]\s*(\d{1,2})\s*[-.\/]\s*(\d{4})/)
        if (bd) { birth_date = `${bd[1].padStart(2,'0')}-${bd[2].padStart(2,'0')}-${bd[3]}`; birth_place = raw.replace(bd[0], '').replace(/[,:\s]+$/, '').trim() }
        else birth_place = raw
        break
      }
    }

    if (!full_name || !nik) return null
    return { nik, full_name: full_name.toUpperCase(), birth_place: birth_place.toUpperCase(), birth_date }
  }

  const nikValue = watch('nik')
  const formValues = watch()

  useEffect(() => {
    if (!/^\d{16}$/.test(nikValue)) { setNikParsed(false); return }
    const date = parseNikDate(nikValue)
    if (date) {
      setValue('birth_date', date, { shouldValidate: true })
      setNikParsed(true)
    }
  }, [nikValue, setValue])

  const packageOptions = Array.from(
    new Map(promos.map((p) => [p.name, p.name])).values()
  )

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setError: (e: string) => void,
    setPreview: (s: string | null) => void,
    isKtp: boolean
  ) => {
    const file = e.target.files?.[0]
    setError('')
    setPreview(null)
    if (!file) { setFile(null); return }

    if (isKtp) {
      setKtpFile(null); setKtpPreview(null)
    }

    const allowedExt = ['.jpg', '.jpeg', '.png']
    const ext = file.name.toLowerCase().split('.').pop()
    if (!ext || !allowedExt.includes('.' + ext) || (file.type && !file.type.startsWith('image/'))) {
      setError('Format file harus JPG/JPEG atau PNG'); setFile(null); return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB'); setFile(null); return
    }
    if (file.type.startsWith('image/')) {
      if (isKtp) {
        setIsOcrLoading(true)
        try {
          const Tesseract = (await import('tesseract.js')).default
          const { data } = await Tesseract.recognize(file, 'ind+eng')
          const parsed = parseKTPText(data.text)
          if (parsed) {
            setValue('nik', parsed.nik, { shouldValidate: true })
            if (parsed.full_name) setValue('full_name', parsed.full_name, { shouldValidate: true })
            if (parsed.birth_date) setValue('birth_date', parsed.birth_date, { shouldValidate: true })
            setTimeout(() => setShowOcrConfirm(true), 300)
          }
        } catch {
          // OCR error — user bisa isi manual
        } finally {
          setIsOcrLoading(false)
        }

        setFile(file)
        const reader = new FileReader()
        reader.onload = (ev) => setPreview(ev.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        setFile(file)
        const reader = new FileReader()
        reader.onload = (ev) => setPreview(ev.target?.result as string)
        reader.readAsDataURL(file)
      }
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!ktpFile) { setKtpError('Foto KTP wajib diunggah'); return }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('full_name', data.full_name)
      formData.append('nik', data.nik)
      formData.append('birth_date', data.birth_date)
      formData.append('phone_number', data.phone_number)
      formData.append('email', data.email)
      formData.append('selected_services', JSON.stringify([data.selected_service]))
      formData.append('installation_address', data.installation_address)
      formData.append('sharelock_link', data.sharelock_link || '')
      formData.append('installation_date', data.installation_date)
      formData.append('promo', data.promo || '')
      formData.append('ktp_photo', ktpFile)
      if (rumahFile) formData.append('front_house_photo', rumahFile)

      const res = await fetch('/api/register', { method: 'POST', body: formData })
      const json = await res.json()

      if (json.success) {
        setIsSuccess(true)
        toast.success('Pendaftaran berhasil! Tim kami akan segera menghubungi Anda.')
        reset(); setKtpFile(null); setKtpPreview(null); setRumahFile(null); setRumahPreview(null); setNikParsed(false)
        if (ktpInputRef.current) ktpInputRef.current.value = ''
        if (rumahInputRef.current) rumahInputRef.current.value = ''
      } else {
        toast.error(json.message || 'Terjadi kesalahan. Silakan coba lagi.')
        setKtpFile(null); setKtpPreview(null); setNikParsed(false); setRumahFile(null); setRumahPreview(null)
        if (ktpInputRef.current) ktpInputRef.current.value = ''
        if (rumahInputRef.current) rumahInputRef.current.value = ''
      }
    } catch {
      toast.error('Gagal mengirim data. Periksa koneksi internet Anda.')
      setKtpFile(null); setKtpPreview(null); setNikParsed(false); setRumahFile(null); setRumahPreview(null)
      if (ktpInputRef.current) ktpInputRef.current.value = ''
      if (rumahInputRef.current) rumahInputRef.current.value = ''
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <section id="register" className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-100/50 rounded-full blur-3xl animate-pulse-glow" />
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="bg-white rounded-3xl p-12 shadow-lg border border-slate-100">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
              <CheckCircle className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Pendaftaran Berhasil!</h2>
            <p className="text-slate-500 mb-8">
              Data Anda sudah kami terima. Tim sales kami akan menghubungi Anda
              dalam 1×24 jam untuk proses aktivasi layanan.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white font-semibold px-8 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-sky-200 hover:scale-105"
            >
              Daftar Lagi
            </button>
          </div>
        </div>
      </section>
    )
  }

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full pl-10 pr-4 py-3 border rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2',
      hasError
        ? 'border-red-300 bg-red-50 focus:ring-red-400'
        : 'border-slate-200 bg-white hover:border-sky-300 focus:ring-sky-400 focus:border-sky-400'
    )

  const textareaClass = (hasError: boolean) =>
    cn(
      'w-full pl-10 pr-4 py-3 border rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 resize-none',
      hasError
        ? 'border-red-300 bg-red-50 focus:ring-red-400'
        : 'border-slate-200 bg-white hover:border-sky-300 focus:ring-sky-400 focus:border-sky-400'
    )

  const UploadZone = ({
    file,
    error,
    preview,
    inputRef,
    label,
    onChange,
    onRemove,
  }: {
    file: File | null
    error: string
    preview: string | null
    inputRef: React.RefObject<HTMLInputElement | null>
    label: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onRemove: () => void
  }) => (
    <fieldset>
      <legend className="block text-sm font-semibold text-slate-700 mb-2">
        {label} <span className="text-red-500" aria-label="wajib">*</span>
      </legend>
      <div
        className={cn(
          'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200',
          error ? 'border-red-300 bg-red-50' : file
            ? 'border-green-300 bg-green-50'
            : 'border-slate-200 hover:border-sky-400 bg-slate-50 hover:bg-sky-50/50'
        )}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        tabIndex={0}
        role="button"
      >
        <input ref={inputRef} type="file" accept="image/jpeg,image/png" onChange={onChange} className="hidden" aria-hidden="true" />
        {error ? (
          <>
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" aria-hidden="true" />
            <p className="text-slate-600 text-sm font-medium mb-1">Klik untuk upload</p>
            <p className="text-slate-400 text-xs">JPG Atau PNG · Maks. 5MB</p>
          </>
        ) : preview ? (
          <div className="relative">
            <img src={preview} alt="" className="max-h-40 mx-auto rounded-lg object-contain" />
            <button type="button" className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md" onClick={(e) => { e.stopPropagation(); onRemove() }} aria-label="Hapus">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : file ? (
          <div className="flex items-center justify-center gap-3 text-green-700">
            <CheckCircle className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" aria-hidden="true" />
            <p className="text-slate-600 text-sm font-medium mb-1">Klik untuk upload</p>
            <p className="text-slate-400 text-xs">JPG Atau PNG · Maks. 5MB</p>
          </>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5" role="alert">{error}</p>}
    </fieldset>
  )

  return (
    <section
      id="register"
      className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden"
      aria-labelledby="register-heading"
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-sky-100/40 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-100/40 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <h2 id="register-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Daftar{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-violet-500">Sekarang</span>
          </h2>
          <p className="text-slate-500 text-lg">
            Isi data di bawah dan tim kami akan menghubungi Anda untuk proses instalasi.
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500 rounded-3xl opacity-0 group-hover:opacity-30 blur transition-opacity duration-500" aria-hidden="true" />
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 sm:p-10 relative">
            <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Form pendaftaran layanan internet">
              <div className="space-y-6">

                {/* Upload KTP */}
                <UploadZone
                  file={ktpFile}
                  error={ktpError}
                  preview={ktpPreview}
                  inputRef={ktpInputRef}
                  label="Foto KTP"
                  onChange={(e) => handleFileUpload(e, setKtpFile, setKtpError, setKtpPreview, true)}
                  onRemove={() => { setKtpFile(null); setKtpPreview(null); setNikParsed(false); if (ktpInputRef.current) ktpInputRef.current.value = '' }}
                />
                <p className="text-slate-400 text-xs mt-1">Pastikan foto KTP jelas, tidak buram, dan semua data (NIK, Nama, TTL) terbaca.</p>
                {isOcrLoading && (
                  <div className="flex items-center gap-2 text-sm text-sky-600">
                    <Loader2 className="w-4 h-4 animate-spin" /> Membaca NIK dari KTP...
                  </div>
                )}

                {/* Nama Lengkap */}
                <div>
                  <label htmlFor="full_name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                    <input id="full_name" type="text" autoComplete="name" placeholder="Sesuai KTP" {...register('full_name')} className={inputClass(!!errors.full_name)} />
                  </div>
                  {errors.full_name && <p className="text-red-500 text-xs mt-1.5" role="alert">{errors.full_name.message}</p>}
                </div>

                {/* NIK */}
                <div>
                  <label htmlFor="nik" className="block text-sm font-semibold text-slate-700 mb-2">
                    NIK (16 digit) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                    <input id="nik" type="text" inputMode="numeric" maxLength={16} placeholder="Nomor Induk Kependudukan" {...register('nik')} className={cn(inputClass(!!errors.nik), nikParsed && 'pr-10')} />
                    {nikParsed && <CheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
                  </div>
                  {errors.nik && <p className="text-red-500 text-xs mt-1.5" role="alert">{errors.nik.message}</p>}
                  {nikParsed && !errors.nik && <p className="text-green-600 text-xs mt-1.5">Format NIK valid</p>}
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <label htmlFor="birth_date" className="block text-sm font-semibold text-slate-700 mb-2">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                    <input id="birth_date" type="date" {...register('birth_date')} className={inputClass(!!errors.birth_date)} />
                  </div>
                  {errors.birth_date && <p className="text-red-500 text-xs mt-1.5" role="alert">{errors.birth_date.message}</p>}
                </div>

                {/* No. HP */}
                <div>
                  <label htmlFor="phone_number" className="block text-sm font-semibold text-slate-700 mb-2">
                    No. HP <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                    <input id="phone_number" type="tel" autoComplete="tel" placeholder="08123456789" {...register('phone_number')} className={inputClass(!!errors.phone_number)} />
                  </div>
                  {errors.phone_number && <p className="text-red-500 text-xs mt-1.5" role="alert">{errors.phone_number.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                    <input id="email" type="email" autoComplete="email" placeholder="contoh@email.com" {...register('email')} className={inputClass(!!errors.email)} />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1.5" role="alert">{errors.email.message}</p>}
                </div>

                {/* Layanan Home — Dropdown */}
                <div>
                  <label htmlFor="selected_service" className="block text-sm font-semibold text-slate-700 mb-2">
                    Layanan / Paket <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Wifi className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                    <select
                      id="selected_service"
                      {...register('selected_service')}
                      className={cn(
                        'w-full pl-10 pr-4 py-3 border rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 appearance-none bg-white',
                        errors.selected_service
                          ? 'border-red-300 bg-red-50 focus:ring-red-400'
                          : 'border-slate-200 hover:border-sky-300 focus:ring-sky-400 focus:border-sky-400'
                      )}
                      aria-label="Pilih layanan paket"
                    >
                      <option value="">— Pilih Paket —</option>
                      {packageOptions.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                  {errors.selected_service && <p className="text-red-500 text-xs mt-1.5" role="alert">{errors.selected_service.message}</p>}
                  {selectedService && !errors.selected_service && (
                    <p className="text-green-600 text-xs mt-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Paket dipilih: <span className="font-semibold">{selectedService}</span>
                    </p>
                  )}
                </div>

                {/* Alamat Instalasi */}
                <div>
                  <label htmlFor="installation_address" className="block text-sm font-semibold text-slate-700 mb-2">
                    Alamat Instalasi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
                    <textarea
                      id="installation_address"
                      rows={3}
                      placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota"
                      {...register('installation_address')}
                      className={textareaClass(!!errors.installation_address)}
                    />
                  </div>
                  {errors.installation_address && <p className="text-red-500 text-xs mt-1.5" role="alert">{errors.installation_address.message}</p>}
                </div>

                {/* Link Sharelock */}
                <div>
                  <label htmlFor="sharelock_link" className="block text-sm font-semibold text-slate-700 mb-2">
                    Link Sharelock / Google Maps
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                    <input
                      id="sharelock_link"
                      type="url"
                      placeholder="https://sharelock.app/... atau https://maps.app.goo.gl/..."
                      {...register('sharelock_link')}
                      className={inputClass(!!errors.sharelock_link)}
                    />
                  </div>
                  {errors.sharelock_link && <p className="text-red-500 text-xs mt-1.5" role="alert">{errors.sharelock_link.message}</p>}
                  <p className="text-xs text-slate-400 mt-1">Opsional — bagikan lokasi via Sharelock atau Google Maps</p>
                </div>

                {/* Foto Depan Rumah */}
                <UploadZone
                  file={rumahFile}
                  error={rumahError}
                  preview={rumahPreview}
                  inputRef={rumahInputRef}
                  label="Foto Depan Rumah"
                  onChange={(e) => handleFileUpload(e, setRumahFile, setRumahError, setRumahPreview, false)}
                  onRemove={() => { setRumahFile(null); setRumahPreview(null); if (rumahInputRef.current) rumahInputRef.current.value = '' }}
                />

                {/* Tanggal Instalasi */}
                <div>
                  <label htmlFor="installation_date" className="block text-sm font-semibold text-slate-700 mb-2">
                    Tanggal Instalasi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                    <input
                      id="installation_date"
                      type="date"
                      {...register('installation_date')}
                      className={inputClass(!!errors.installation_date)}
                    />
                  </div>
                  {errors.installation_date && <p className="text-red-500 text-xs mt-1.5" role="alert">{errors.installation_date.message}</p>}
                </div>

                {/* Promo */}
                <div>
                  <label htmlFor="promo" className="block text-sm font-semibold text-slate-700 mb-2">
                    Kode Promo (opsional)
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                    <input
                      id="promo"
                      type="text"
                      placeholder="cth. PROMO60"
                      {...register('promo')}
                      className={inputClass(false)}
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 disabled:from-sky-300 disabled:to-blue-300 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 text-base mt-2 btn-shine hover:shadow-lg hover:shadow-sky-200 hover:scale-[1.01]"
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Mengirim Data...</>
                  ) : (
                    'Kirim Pendaftaran'
                  )}
                </button>

                <p className="text-xs text-slate-400 text-center">
                  Dengan mendaftar, Anda menyetujui penggunaan data pribadi Anda
                  untuk keperluan aktivasi layanan internet.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
        {showOcrConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 w-full border border-slate-100 animate-in fade-in zoom-in">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-200">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Data KTP Terbaca</h3>
                <p className="text-slate-500 text-sm mt-1">Periksa kembali data di bawah ini sebelum lanjut</p>
                <p className="text-amber-600 text-xs mt-2 bg-amber-50 rounded-lg p-2 border border-amber-200">⚠️ Pastikan data NIK dan Nama sesuai dengan KTP asli Anda. Data yang salah dapat menghambat proses pendaftaran.</p>
              </div>
              <div className="space-y-3 bg-slate-50 rounded-2xl p-4 mb-6 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Nama</span><span className="font-semibold text-slate-900 text-right max-w-[60%]">{formValues.full_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">NIK</span><span className="font-semibold text-slate-900">{formValues.nik}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Tanggal Lahir</span><span className="font-semibold text-slate-900">{formValues.birth_date ? new Date(formValues.birth_date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span></div>
              </div>
              <button
                onClick={() => setShowOcrConfirm(false)}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white font-semibold py-3.5 px-6 rounded-xl transition-all hover:shadow-lg hover:shadow-sky-200"
              >
                Sudah Sesuai, Lanjutkan
              </button>
            </div>
          </div>
        )}
    </section>
  )
}


