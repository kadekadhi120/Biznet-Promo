import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import AdminSidebar from './_components/AdminSidebar'
import { AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Admin Dashboard — Biznet Home',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verifikasi auth di server
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Middleware sudah proteksi /admin/** kecuali /admin/login.
  // Kalau sampai sini tanpa user, berarti lg di /admin/login — render aja.
  if (!user) {
    return <>{children}</>
  }

  // Verifikasi role admin
  const serviceClient = createServiceClient()
  const { data: adminData } = await serviceClient
    .from('admins')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (!adminData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-white mb-3">Akses Ditolak</h1>
          <p className="text-slate-400 mb-8">
            Akun Anda tidak terdaftar sebagai administrator.
            Hubungi admin teknis untuk mendapatkan akses.
          </p>
          <Link
            href="/admin/login"
            className="inline-block bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <AdminSidebar adminName={adminData.full_name} adminEmail={user.email || ''} />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
