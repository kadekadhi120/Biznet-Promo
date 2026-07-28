'use client'

import { useRef, useState } from 'react'
import type { Promo, CostBreakdown } from '@/lib/types'
import { formatRupiah } from '@/lib/utils'
import {
  Wifi,
  Database,
  Monitor,
  ChevronRight,
  ArrowUpDown,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PromoCardProps {
  promo: Promo
  cost: CostBreakdown
  onDaftar: () => void
}

export default function PromoCard({ promo, cost, onDaftar }: PromoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const isGamers = promo.badge_label?.toLowerCase().includes('gamer')

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -12, y: x * 12 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setIsHovered(false)
  }

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative rounded-2xl border transition-all duration-300 flex flex-col h-full overflow-hidden',
        'card-hover',
        isGamers
          ? 'border-purple-200/60 shadow-purple-100/30 hover:shadow-purple-200/50'
          : 'border-slate-200/60 shadow-slate-100/30 hover:shadow-sky-200/40',
        isGamers && 'bg-gradient-to-b from-white to-purple-50/30',
        !isGamers && 'bg-gradient-to-b from-white to-sky-50/20'
      )}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: isHovered ? 'none' : 'transform 0.5s ease, box-shadow 0.3s ease',
      }}
      aria-label={`Paket ${promo.name}`}
    >
      {/* Glow edge on hover */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 pointer-events-none',
          isHovered && 'opacity-100'
        )}
        style={{
          background: isGamers
            ? 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(236,72,153,0.08))'
            : 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(99,102,241,0.08))',
        }}
        aria-hidden="true"
      />

      {/* Badge */}
      {promo.badge_label && (
        <div
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-3 py-1 text-center"
          aria-label={`Badge: ${promo.badge_label}`}
        >
          ✦ {promo.badge_label}
        </div>
      )}

      <div className="p-6 flex flex-col flex-1 relative z-10">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {promo.name}
            </h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                'text-3xl font-extrabold',
                isGamers ? 'text-purple-600' : 'text-sky-600'
              )}
            >
              {formatRupiah(promo.price_monthly)}
            </span>
            <span className="text-slate-400 text-sm">/bulan</span>
          </div>
        </div>

        {/* Speed highlight */}
        <div
          className={cn(
            'rounded-xl p-4 mb-5 text-center relative overflow-hidden',
            isGamers ? 'bg-purple-50' : 'bg-sky-50'
          )}
        >
          {isHovered && (
            <div
              className={cn(
                'absolute inset-0 opacity-20',
                isGamers ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gradient-to-r from-sky-400 to-blue-400'
              )}
              style={{
                transform: `translateX(${isHovered ? 100 : -100}%)`,
                transition: 'transform 0.6s ease',
              }}
              aria-hidden="true"
            />
          )}
          <div
            className={cn(
              'text-4xl font-black relative',
              isGamers ? 'text-purple-600' : 'text-sky-600'
            )}
          >
            {promo.speed_mbps}
          </div>
          <div className="text-slate-500 text-sm font-medium relative">Mbps</div>
          <div className="text-xs text-slate-400 mt-1 relative">
            {promo.bandwidth_type === 'symmetrical'
              ? 'Upload = Download (Simetris)'
              : 'Asymmetrical'}
          </div>
        </div>

        {/* Specs */}
        <ul className="space-y-3 mb-6 flex-1" aria-label="Spesifikasi paket">
          <li className="flex items-center gap-3 text-sm text-slate-600 group/spec">
            <Database className="w-4 h-4 text-slate-400 flex-shrink-0 group-hover/spec:text-sky-500 transition-colors" aria-hidden="true" />
            <span>
              FUP{' '}
              <strong className="text-slate-800">
                {promo.fup_gb ? `${promo.fup_gb} GB` : 'Unlimited'}
              </strong>
            </span>
          </li>
          {promo.free_extra_quota_gb != null && promo.free_extra_quota_gb > 0 && (
            <li className="flex items-center gap-3 text-sm text-slate-600 group/spec">
              <Wifi className="w-4 h-4 text-slate-400 flex-shrink-0 group-hover/spec:text-sky-500 transition-colors" aria-hidden="true" />
              <span>
                Free Extra Quota{' '}
                <strong className="text-slate-800">
                  {promo.free_extra_quota_gb} GB
                </strong>
              </span>
            </li>
          )}
          {promo.downgrade_speed_mbps != null && (
            <li className="flex items-center gap-3 text-sm text-slate-600 group/spec">
              <ArrowUpDown className="w-4 h-4 text-slate-400 flex-shrink-0 group-hover/spec:text-sky-500 transition-colors" aria-hidden="true" />
              <span>
                After FUP:{' '}
                <strong className="text-slate-800">
                  {promo.downgrade_speed_mbps} Mbps
                </strong>
              </span>
            </li>
          )}
          {promo.device_range && (
            <li className="flex items-center gap-3 text-sm text-slate-600 group/spec">
              <Monitor className="w-4 h-4 text-slate-400 flex-shrink-0 group-hover/spec:text-sky-500 transition-colors" aria-hidden="true" />
              <span>
                {promo.device_range}{' '}
                <strong className="text-slate-800">Device</strong>
              </span>
            </li>
          )}
          <li className="flex items-center gap-3 text-sm text-slate-600 group/spec">
            <Globe className="w-4 h-4 text-slate-400 flex-shrink-0 group-hover/spec:text-sky-500 transition-colors" aria-hidden="true" />
            <span>
              IP{' '}
              <strong className="text-slate-800 capitalize">
                {promo.ip_type}
              </strong>
            </span>
          </li>
        </ul>

        {/* Cost breakdown */}
        <div className="bg-slate-50/80 backdrop-blur-sm rounded-xl p-4 mb-5 text-sm border border-slate-100">
          <p className="font-semibold text-slate-700 mb-3 text-xs uppercase tracking-wide">
            Rincian Biaya Awal
          </p>
          <ul className="space-y-1.5" aria-label="Rincian biaya awal pelanggan baru">
            <li className="flex justify-between text-slate-600">
              <span>Biaya Paket</span>
              <span>{formatRupiah(cost.biaya_paket)}</span>
            </li>
            {cost.sewa_modem > 0 && (
              <li className="flex justify-between text-slate-600">
                <span>Sewa Modem</span>
                <span>{formatRupiah(cost.sewa_modem)}</span>
              </li>
            )}
            <li className="flex justify-between text-slate-600">
              <span>Biaya Instalasi</span>
              <span>{formatRupiah(cost.biaya_instalasi)}</span>
            </li>
            <li className="flex justify-between text-slate-600">
              <span>PPN {promo.ppn_percent}%</span>
              <span>{formatRupiah(cost.ppn_amount)}</span>
            </li>
            <li className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2 mt-2">
              <span>Total Awal</span>
              <span className={isGamers ? 'text-purple-600' : 'text-sky-600'}>
                {formatRupiah(cost.total)}
              </span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <button
          onClick={onDaftar}
          className={cn(
            'w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all btn-shine',
            isGamers
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 hover:scale-[1.02]'
              : 'bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white shadow-lg shadow-sky-200 hover:shadow-xl hover:shadow-sky-300 hover:scale-[1.02]'
          )}
        >
          Daftar Paket Ini
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
