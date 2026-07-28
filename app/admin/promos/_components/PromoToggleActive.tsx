'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface PromoToggleActiveProps {
  id: string
  isActive: boolean
}

export default function PromoToggleActive({ id, isActive }: PromoToggleActiveProps) {
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    const prev = active
    setActive(!prev) // optimistic

    try {
      const res = await fetch(`/api/admin/promos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !prev }),
      })
      const json = await res.json()

      if (!json.success) {
        setActive(prev)
        toast.error('Gagal mengubah status paket.')
      } else {
        toast.success(!prev ? 'Paket diaktifkan.' : 'Paket dinonaktifkan.')
        router.refresh()
      }
    } catch {
      setActive(prev)
      toast.error('Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:opacity-50 ${
        active ? 'bg-sky-500' : 'bg-slate-200'
      }`}
      role="switch"
      aria-checked={active}
      aria-label={active ? 'Nonaktifkan paket' : 'Aktifkan paket'}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          active ? 'translate-x-6' : 'translate-x-1'
        }`}
        aria-hidden="true"
      />
    </button>
  )
}
