'use client'

import { useState, useMemo } from 'react'
import type { Promo, SchemeType, PromoType } from '@/lib/types'
import { formatRupiah, PROMO_LABELS } from '@/lib/utils'
import { calculateCost } from '@/lib/types'
import PromoCard from './PromoCard'
import ScrollReveal from './ScrollReveal'
import { ToggleLeft, ToggleRight, ChevronDown } from 'lucide-react'

interface PricingSectionProps {
  promos: Promo[]
}

export default function PricingSection({ promos }: PricingSectionProps) {
  const [scheme, setScheme] = useState<SchemeType>('rent')
  const [promoType, setPromoType] = useState<PromoType>('normal')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Ambil promo types yang tersedia dari data
  const availablePromoTypes = useMemo(() => {
    const types = Array.from(new Set(promos.map((p) => p.promo_type)))
    return types as PromoType[]
  }, [promos])

  // Filter kartu berdasarkan scheme & promo yang dipilih
  const filteredPromos = useMemo(() => {
    return promos
      .filter((p) => p.scheme_type === scheme && p.promo_type === promoType)
      .sort((a, b) => a.display_order - b.display_order)
  }, [promos, scheme, promoType])

  const scrollToRegister = (promoName?: string) => {
    const el = document.getElementById('register')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      // Trigger custom event agar form bisa prefill paket
      if (promoName) {
        window.dispatchEvent(
          new CustomEvent('selectPromo', { detail: promoName })
        )
      }
    }
  }

  return (
    <section
      id="pricing"
      className="py-24 bg-white"
      aria-labelledby="pricing-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-12">
          <h2
            id="pricing-heading"
            className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4"
          >
            Pilih Paket yang{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-500">
              Sesuai Kebutuhan
            </span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Harga transparan tanpa biaya tersembunyi. Semua biaya sudah
            termasuk PPN 11%.
          </p>
        </ScrollReveal>

        {/* Controls */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            {/* Toggle Skema Modem */}
            <div
              className="flex items-center gap-3 bg-slate-100 rounded-full p-1.5"
              role="group"
              aria-label="Pilih skema modem"
            >
              <button
                onClick={() => setScheme('rent')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  scheme === 'rent'
                    ? 'bg-white text-sky-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                aria-pressed={scheme === 'rent'}
              >
                <ToggleLeft className="w-4 h-4" aria-hidden="true" />
                Sewa Modem
              </button>
              <button
                onClick={() => setScheme('buy')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  scheme === 'buy'
                    ? 'bg-white text-sky-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                aria-pressed={scheme === 'buy'}
              >
                <ToggleRight className="w-4 h-4" aria-hidden="true" />
                Beli Modem
              </button>
            </div>

            {/* Dropdown Promo */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-white border border-slate-200 hover:border-sky-400 rounded-full px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors shadow-sm"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-label="Pilih promo biaya awal"
              >
                {PROMO_LABELS[promoType] || promoType}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {isDropdownOpen && (
                <ul
                  className="absolute top-full mt-2 left-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 min-w-[220px] py-2 overflow-hidden"
                  role="listbox"
                  aria-label="Opsi promo biaya awal"
                >
                  {availablePromoTypes.map((type) => (
                    <li key={type} role="option" aria-selected={promoType === type}>
                      <button
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          promoType === type
                            ? 'bg-sky-50 text-sky-600 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                        onClick={() => {
                          setPromoType(type)
                          setIsDropdownOpen(false)
                        }}
                      >
                        {PROMO_LABELS[type] || type}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Pricing Cards */}
        {filteredPromos.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p>Tidak ada paket tersedia untuk kombinasi ini.</p>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              filteredPromos.length === 1
                ? 'grid-cols-1 max-w-sm mx-auto'
                : filteredPromos.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
                : filteredPromos.length === 3
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}
          >
            {filteredPromos.map((promo, idx) => (
              <ScrollReveal key={promo.id} delay={idx * 80}>
                <PromoCard
                  promo={promo}
                  cost={calculateCost(promo)}
                  onDaftar={() => scrollToRegister(promo.name)}
                />
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* Note */}
        <ScrollReveal>
          <p className="text-center text-xs text-slate-400 mt-8">
            * Harga sudah termasuk PPN 11%. Biaya instalasi dibayarkan satu
            kali di awal. Sewa modem dibayarkan setiap bulan bersama biaya
            paket.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
