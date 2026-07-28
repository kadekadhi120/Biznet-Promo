'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Package,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/promos', label: 'Kelola Paket', icon: Package, exact: false },
  { href: '/admin/submissions', label: 'Data Pendaftar', icon: Users, exact: false },
]

interface AdminSidebarProps {
  adminName: string
  adminEmail: string
}

export default function AdminSidebar({ adminName, adminEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo — klik logout & balik ke main page */}
      <div className="px-6 py-5 border-b border-slate-700">
        <button
          onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            window.location.href = '/'
          }}
          className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
          aria-label="Logout dan kembali ke halaman utama"
        >
          <div className="p-1.5 bg-white rounded-lg">
            <Image src="/logoBiznet.png" alt="Biznet Home" width={20} height={20} className="w-5 h-5 object-contain" unoptimized />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Biznet Home</p>
            <p className="text-slate-400 text-xs">Admin Panel</p>
          </div>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4" aria-label="Admin navigation">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    active
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="flex-1">{label}</span>
                  {active && (
                    <ChevronRight className="w-3 h-3" aria-hidden="true" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User info & logout */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="mb-3 px-2">
          <p className="text-white text-sm font-semibold truncate">{adminName}</p>
          <p className="text-slate-400 text-xs truncate">{adminEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-all disabled:opacity-50"
          aria-label="Keluar dari dashboard"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          {loggingOut ? 'Keluar...' : 'Keluar'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-slate-800 text-white p-2 rounded-xl shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Tutup sidebar' : 'Buka sidebar'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-slate-800 z-40 transform transition-transform duration-300 md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-800 fixed top-0 left-0 h-full z-20">
        <SidebarContent />
      </aside>
    </>
  )
}
