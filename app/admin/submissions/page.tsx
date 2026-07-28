import { createServiceClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import RetryButton from './_components/RetryButton'
import type { FormSubmission } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

const STATUS_BADGE = {
  success: {
    label: 'Tersinkronisasi',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    icon: CheckCircle,
  },
  pending: {
    label: 'Menunggu',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
    icon: Clock,
  },
  failed: {
    label: 'Gagal',
    className: 'bg-red-50 text-red-700 border border-red-200',
    icon: XCircle,
  },
}

export default async function SubmissionsPage({ searchParams }: PageProps) {
  const { status, page: pageParam } = await searchParams
  const page = Number(pageParam || 1)
  const limit = 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  const supabase = createServiceClient()

  let query = supabase
    .from('form_submissions')
    .select(
      'id, full_name, email, phone_number, selected_services, installation_address, installation_date, promo, notion_sync_status, notion_sync_error, created_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status && ['success', 'pending', 'failed'].includes(status)) {
    query = query.eq('notion_sync_status', status)
  }

  const { data: submissions, count, error } = await query
  const total = count ?? 0
  const totalPages = Math.ceil(total / limit)

  const statusFilter = [
    { value: '', label: 'Semua' },
    { value: 'success', label: 'Tersinkronisasi' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'failed', label: 'Gagal' },
  ]

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Gagal memuat data: {error.message}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Data Pendaftar</h1>
        <p className="text-slate-500 text-sm mt-1">
          {total} pendaftar ditemukan
        </p>
      </div>

      {/* Filter tabs */}
      <div
        className="flex flex-wrap gap-2 mb-6"
        role="tablist"
        aria-label="Filter status sinkronisasi"
      >
        {statusFilter.map(({ value, label }) => {
          const isActive = (status || '') === value
          return (
            <a
              key={value}
              href={`/admin/submissions${value ? `?status=${value}` : ''}`}
              role="tab"
              aria-selected={isActive}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {label}
            </a>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                  Nama / Email
                </th>
                <th className="text-left px-4 py-4 font-semibold text-slate-600 hidden sm:table-cell">
                  No. HP
                </th>
                <th className="text-left px-4 py-4 font-semibold text-slate-600 hidden md:table-cell">
                  Paket Diminati
                </th>
                <th className="text-left px-4 py-4 font-semibold text-slate-600 hidden xl:table-cell">
                  Alamat
                </th>
                <th className="text-left px-4 py-4 font-semibold text-slate-600 hidden 2xl:table-cell">
                  Tgl. Instalasi
                </th>
                <th className="text-left px-4 py-4 font-semibold text-slate-600 hidden 2xl:table-cell">
                  Promo
                </th>
                <th className="text-center px-4 py-4 font-semibold text-slate-600">
                  Notion
                </th>
                <th className="text-left px-4 py-4 font-semibold text-slate-600 hidden lg:table-cell">
                  Tanggal Daftar
                </th>
                <th className="text-right px-6 py-4 font-semibold text-slate-600">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(submissions ?? []).map((sub: Pick<FormSubmission, 'id' | 'full_name' | 'email' | 'phone_number' | 'selected_services' | 'installation_address' | 'installation_date' | 'promo' | 'notion_sync_status' | 'notion_sync_error' | 'created_at'>) => {
                const statusInfo =
                  STATUS_BADGE[sub.notion_sync_status as keyof typeof STATUS_BADGE] ??
                  STATUS_BADGE.pending
                const StatusIcon = statusInfo.icon

                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{sub.full_name}</p>
                      <p className="text-xs text-slate-400">{sub.email}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600 hidden sm:table-cell">
                      {sub.phone_number}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(sub.selected_services || []).map((svc: string) => (
                          <span
                            key={svc}
                            className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md"
                          >
                            {svc}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden xl:table-cell">
                      <p className="text-xs text-slate-600 truncate max-w-[200px]" title={sub.installation_address}>
                        {sub.installation_address || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-4 hidden 2xl:table-cell">
                      <span className="text-xs text-slate-600">
                        {sub.installation_date ? formatDate(sub.installation_date) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden 2xl:table-cell">
                      <span className="text-xs text-slate-600">
                        {sub.promo || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.className}`}
                          title={
                            sub.notion_sync_status === 'failed'
                              ? sub.notion_sync_error || 'Error tidak diketahui'
                              : statusInfo.label
                          }
                        >
                          <StatusIcon
                            className="w-3 h-3"
                            aria-hidden="true"
                          />
                          <span className="hidden sm:inline">{statusInfo.label}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-xs hidden lg:table-cell">
                      {formatDate(sub.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {sub.notion_sync_status !== 'success' && (
                        <RetryButton submissionId={sub.id} />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {(!submissions || submissions.length === 0) && (
            <div className="py-16 text-center text-slate-400 text-sm">
              {status ? 'Tidak ada submission dengan status ini.' : 'Belum ada pendaftar.'}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-6 py-4 border-t border-slate-100"
            aria-label="Pagination"
          >
            <p className="text-sm text-slate-500">
              Halaman {page} dari {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <a
                  href={`/admin/submissions?${status ? `status=${status}&` : ''}page=${page - 1}`}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Sebelumnya
                </a>
              )}
              {page < totalPages && (
                <a
                  href={`/admin/submissions?${status ? `status=${status}&` : ''}page=${page + 1}`}
                  className="px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-400 transition-colors"
                >
                  Selanjutnya
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
