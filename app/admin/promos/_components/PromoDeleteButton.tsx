'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Trash2, Loader2 } from 'lucide-react'

interface PromoDeleteButtonProps {
  id: string
  name: string
}

export default function PromoDeleteButton({ id, name }: PromoDeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Yakin ingin menghapus paket "${name}"? Tindakan ini tidak bisa dibatalkan.`)) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/promos/${id}`, { method: 'DELETE' })
      const json = await res.json()

      if (json.success) {
        toast.success('Paket berhasil dihapus.')
        router.refresh()
      } else {
        toast.error(json.message || 'Gagal menghapus paket.')
      }
    } catch {
      toast.error('Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      aria-label={`Hapus paket ${name}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  )
}
