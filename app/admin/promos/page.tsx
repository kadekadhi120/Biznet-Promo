import { createServiceClient } from '@/lib/supabase/server'
import type { Promo } from '@/lib/types'
import { formatRupiah, formatDate } from '@/lib/utils'
import Link from 'next/link'
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import PromoToggleActive from './_components/PromoToggleActive'
import PromoDeleteButton from './_components/PromoDeleteButton'

export default async function PromosPage() {
  const supabase = createServiceClient()

  // Fetch admin name map untuk audit log
  const { data: adminList } = await supabase
    .from('admins')
    .select('id, full_name')
  const adminRecord: Record<string, string> = Object.fromEntries(
    (adminList ?? []).map((a: { id: string; full_name: string }) => [a.id, a.full_name])
  )

  const { data: promos, error } = await supabase
    .from('promos')
    .select('*')
    .order('scheme_type', { ascending: true })
    .order('display_order', { ascending: true })

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Gagal memuat data paket: {error.message}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Paket</h1>
          <p className="text-slate-500 text-sm mt-1">
            {promos?.length ?? 0} paket tersedia
          </p>
        </div>
        <Link
          href="/admin/promos/new"
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Tambah Paket
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-4 font-semibold text-slate-600 whitespace-nowrap">
                  Nama Paket
                </th>
                <th className="text-left px-4 py-4 font-semibold text-slate-600">
                  Skema
                </th>
                <th className="text-right px-4 py-4 font-semibold text-slate-600">
                  Harga/Bln
                </th>
                <th className="text-right px-4 py-4 font-semibold text-slate-600">
                  Speed
                </th>
                <th className="text-center px-4 py-4 font-semibold text-slate-600">
                  Status
                </th>
                <th className="text-center px-4 py-4 font-semibold text-slate-600">
                  Order
                </th>
                <th className="text-left px-4 py-4 font-semibold text-slate-600 hidden xl:table-cell">
                  Terakhir Diubah
                </th>
                <th className="text-right px-6 py-4 font-semibold text-slate-600">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(promos ?? []).map((promo: Promo) => (
                <tr key={promo.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">
                        {promo.name}
                      </span>
                      {promo.badge_label && (
                        <span className="badge-gamers text-white text-xs px-2 py-0.5 rounded-full">
                          {promo.badge_label}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {promo.promo_type}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        promo.scheme_type === 'rent'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-violet-50 text-violet-700'
                      }`}
                    >
                      {promo.scheme_type === 'rent' ? (
                        <ToggleLeft className="w-3 h-3" aria-hidden="true" />
                      ) : (
                        <ToggleRight className="w-3 h-3" aria-hidden="true" />
                      )}
                      {promo.scheme_type === 'rent' ? 'Sewa' : 'Beli'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-slate-800">
                    {formatRupiah(promo.price_monthly)}
                  </td>
                  <td className="px-4 py-4 text-right text-slate-600">
                    {promo.speed_mbps} Mbps
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      <PromoToggleActive
                        id={promo.id}
                        isActive={promo.is_active}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-slate-500">
                    {promo.display_order}
                  </td>
                  <td className="px-4 py-4 hidden xl:table-cell">
                    <div className="text-xs">
                      <p className="text-slate-500">
                        {promo.updated_by
                          ? (adminRecord[promo.updated_by] ?? '—')
                          : '—'}
                      </p>
                      <p className="text-slate-400 mt-0.5">
                        {promo.updated_at ? formatDate(promo.updated_at) : '—'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/promos/${promo.id}/edit`}
                        className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                        aria-label={`Edit paket ${promo.name}`}
                      >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                      </Link>
                      <PromoDeleteButton id={promo.id} name={promo.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!promos || promos.length === 0) && (
            <div className="py-16 text-center text-slate-400 text-sm">
              Belum ada paket. Klik &quot;Tambah Paket&quot; untuk membuat yang
              pertama.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
