import { createServiceClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import {
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = createServiceClient()

  // Fetch stats paralel
  const [promosResult, submissionsResult, failedResult, recentResult] =
    await Promise.all([
      supabase.from('promos').select('id, is_active', { count: 'exact' }),
      supabase
        .from('form_submissions')
        .select('id', { count: 'exact' }),
      supabase
        .from('form_submissions')
        .select('id', { count: 'exact' })
        .eq('notion_sync_status', 'failed'),
      supabase
        .from('form_submissions')
        .select('id, full_name, email, notion_sync_status, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

  const totalPromos = promosResult.count ?? 0
  const activePromos =
    promosResult.data?.filter((p: { is_active: boolean }) => p.is_active).length ?? 0
  const totalSubmissions = submissionsResult.count ?? 0
  const failedSync = failedResult.count ?? 0
  const recentSubmissions = recentResult.data ?? []

  const stats = [
    {
      label: 'Total Paket',
      value: totalPromos,
      sub: `${activePromos} aktif`,
      icon: Package,
      color: 'bg-sky-500',
      href: '/admin/promos',
    },
    {
      label: 'Total Pendaftar',
      value: totalSubmissions,
      sub: 'Semua waktu',
      icon: Users,
      color: 'bg-emerald-500',
      href: '/admin/submissions',
    },
    {
      label: 'Gagal Sync Notion',
      value: failedSync,
      sub: failedSync > 0 ? 'Perlu retry manual' : 'Semua OK',
      icon: failedSync > 0 ? AlertTriangle : TrendingUp,
      color: failedSync > 0 ? 'bg-red-500' : 'bg-violet-500',
      href: '/admin/submissions?status=failed',
    },
  ]

  const syncStatusIcon = {
    success: <CheckCircle className="w-4 h-4 text-emerald-500" aria-label="Tersinkronisasi" />,
    pending: <Clock className="w-4 h-4 text-amber-500" aria-label="Menunggu" />,
    failed: <XCircle className="w-4 h-4 text-red-500" aria-label="Gagal" />,
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Selamat datang di panel admin Biznet Home.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {stats.map(({ label, value, sub, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
            aria-label={`${label}: ${value}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${color} p-2.5 rounded-xl`}>
                <Icon className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <ArrowRight
                className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all"
                aria-hidden="true"
              />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
            <div className="text-sm font-medium text-slate-700">{label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
          </Link>
        ))}
      </div>

      {/* Recent submissions */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Pendaftar Terbaru</h2>
          <Link
            href="/admin/submissions"
            className="text-sky-500 hover:text-sky-600 text-sm font-medium flex items-center gap-1"
          >
            Lihat semua
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>

        {recentSubmissions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Belum ada pendaftar.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentSubmissions.map((sub: { id: string; full_name: string; email: string; notion_sync_status: string; created_at: string }) => (
              <div
                key={sub.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-slate-500">
                    {sub.full_name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {sub.full_name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{sub.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {syncStatusIcon[sub.notion_sync_status as keyof typeof syncStatusIcon]}
                  <span className="text-xs text-slate-400 hidden sm:block">
                    {formatDate(sub.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <Link
          href="/admin/promos/new"
          className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md p-5 transition-all group"
        >
          <div className="bg-sky-50 p-3 rounded-xl">
            <Package className="w-5 h-5 text-sky-500" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Tambah Paket Baru</p>
            <p className="text-xs text-slate-400">Buat kartu promo baru di landing page</p>
          </div>
          <ArrowRight
            className="w-4 h-4 text-slate-300 ml-auto group-hover:text-sky-400 group-hover:translate-x-1 transition-all"
            aria-hidden="true"
          />
        </Link>

        <Link
          href="/admin/submissions?status=failed"
          className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md p-5 transition-all group"
        >
          <div className="bg-red-50 p-3 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Retry Sync Notion</p>
            <p className="text-xs text-slate-400">
              {failedSync > 0
                ? `${failedSync} submission perlu disinkronkan ulang`
                : 'Semua submission tersinkronisasi'}
            </p>
          </div>
          <ArrowRight
            className="w-4 h-4 text-slate-300 ml-auto group-hover:text-red-400 group-hover:translate-x-1 transition-all"
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  )
}
