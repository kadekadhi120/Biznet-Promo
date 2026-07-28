'use client'

import { useRef } from 'react'
import ScrollReveal from './ScrollReveal'
import {
  Zap,
  Shield,
  HeadphonesIcon,
  Wifi,
  Globe,
  Gamepad2,
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Kecepatan Tinggi',
    description:
      'Teknologi fiber optic murni (FTTH) memastikan kecepatan download dan upload yang konsisten hingga 500Mbps.',
    gradient: 'from-sky-500 to-blue-500',
    bgGlow: 'bg-sky-100',
  },
  {
    icon: Shield,
    title: 'Koneksi Stabil',
    description:
      'Infrastruktur jaringan handal dengan uptime 99.9% dan minimal gangguan untuk aktivitas online Anda.',
    gradient: 'from-emerald-500 to-teal-500',
    bgGlow: 'bg-emerald-100',
  },
  {
    icon: HeadphonesIcon,
    title: 'Dukungan 24/7',
    description:
      'Tim teknisi siap membantu Anda kapan saja melalui telepon, chat, atau kunjungan langsung ke lokasi.',
    gradient: 'from-violet-500 to-purple-500',
    bgGlow: 'bg-violet-100',
  },
  {
    icon: Wifi,
    title: 'Modem WiFi 6',
    description:
      'Modem modern dengan teknologi WiFi 6 untuk jangkauan yang luas dan koneksi stabil di seluruh rumah.',
    gradient: 'from-orange-500 to-amber-500',
    bgGlow: 'bg-orange-100',
  },
  {
    icon: Globe,
    title: 'Tanpa Kontrak',
    description:
      'Pilih paket sesuai kebutuhan tanpa terikat kontrak jangka panjang. Bebas upgrade kapan saja.',
    gradient: 'from-cyan-500 to-sky-500',
    bgGlow: 'bg-cyan-100',
  },
  {
    icon: Gamepad2,
    title: 'Gaming Friendly',
    description:
      'Paket Gamers Edition dengan koneksi simetris (upload = download) dan IP Publik untuk pengalaman gaming terbaik.',
    gradient: 'from-pink-500 to-rose-500',
    bgGlow: 'bg-pink-100',
  },
]

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden"
      aria-labelledby="features-heading"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <ScrollReveal className="text-center mb-16">
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4"
          >
            Kenapa Memilih{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-violet-500">
              Biznet Home?
            </span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Lebih dari sekedar internet — kami menghadirkan pengalaman
            koneksi terbaik untuk seluruh keluarga.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <ScrollReveal key={feature.title} delay={idx * 100}>
              <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100/60 h-full relative overflow-hidden card-hover">
                {/* Hover gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}
                  aria-hidden="true"
                />

                {/* Icon */}
                <div
                  className={`p-3 ${feature.bgGlow} rounded-xl w-fit mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                >
                  <feature.icon
                    className={`w-6 h-6 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`}
                    aria-hidden="true"
                  />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 transition-all">
                  {feature.title}
                </h3>

                <p className="text-slate-500 leading-relaxed text-sm group-hover:text-slate-600 transition-colors">
                  {feature.description}
                </p>

                {/* Bottom accent line */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
                  aria-hidden="true"
                />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
