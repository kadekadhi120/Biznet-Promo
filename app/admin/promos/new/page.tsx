import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import PromoForm from '../_components/PromoForm'

export default function NewPromoPage() {
  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/promos"
          className="flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm mb-4 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Kembali ke Daftar Paket
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Tambah Paket Baru</h1>
        <p className="text-slate-500 text-sm mt-1">
          Paket yang aktif akan langsung tampil di landing page.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <PromoForm />
      </div>
    </div>
  )
}
