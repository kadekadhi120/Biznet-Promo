'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { RotateCcw, Loader2 } from 'lucide-react'

interface RetryButtonProps {
  submissionId: string
}

export default function RetryButton({ submissionId }: RetryButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRetry = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/admin/submissions/${submissionId}/retry`,
        { method: 'POST' }
      )
      const json = await res.json()

      if (json.success) {
        toast.success('Berhasil disinkronkan ke Notion.')
        router.refresh()
      } else {
        toast.error(json.message || 'Retry gagal. Coba lagi nanti.')
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRetry}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      aria-label="Retry sinkronisasi ke Notion"
      aria-busy={loading}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
      )}
      Retry
    </button>
  )
}
