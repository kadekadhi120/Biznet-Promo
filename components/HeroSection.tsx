'use client'

import { Wifi, ChevronDown, Zap, Shield, Clock } from 'lucide-react'

export default function HeroSection() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 animate-gradient" />

      {/* Floating decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-[10%] w-64 h-64 bg-sky-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-[15%] w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-float-slow" />

        {/* Geometric shapes */}
        <div className="absolute top-[15%] right-[20%] w-16 h-16 border border-sky-400/20 rounded-xl rotate-45 animate-float-slow" />
        <div className="absolute bottom-[20%] left-[12%] w-12 h-12 border border-sky-400/20 rounded-full animate-float-delayed" />
        <div className="absolute top-[30%] left-[25%] w-8 h-8 bg-sky-400/10 rounded-full animate-float" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-400/20 text-sky-300 text-sm font-medium px-4 py-2 rounded-full mb-8 animate-fade-in-up backdrop-blur-sm">
          <Zap className="w-4 h-4" aria-hidden="true" />
          Internet Fiber Tercepat untuk Rumah Anda
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-fade-in-up">
          Internet{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">
            Cepat & Stabil
          </span>
          <br />
          untuk Keluarga Anda
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up">
          Nikmati koneksi fiber optic dengan kecepatan hingga{' '}
          <strong className="text-white">500 Mbps</strong>. Cocok untuk
          streaming, gaming, dan bekerja dari rumah tanpa gangguan.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up">
          <button
            onClick={() => scrollTo('pricing')}
            className="btn-shine bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-sky-500/30"
          >
            Lihat Paket
          </button>
          <button
            onClick={() => scrollTo('register')}
            className="border border-white/30 hover:border-white/60 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:bg-white/10 hover:scale-105 backdrop-blur-sm"
          >
            Daftar Sekarang
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto animate-fade-in-up">
          {[
            { icon: Zap, value: '500Mbps', label: 'Kecepatan Max' },
            { icon: Shield, value: '99.9%', label: 'Uptime' },
            { icon: Clock, value: '24/7', label: 'Support' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center group">
              <div className="inline-flex p-3 rounded-xl bg-white/5 group-hover:bg-sky-500/20 transition-colors mb-2">
                <Icon className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" aria-hidden="true" />
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => scrollTo('pricing')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 hover:text-white transition-colors animate-bounce"
        aria-label="Scroll ke bawah untuk melihat paket"
      >
        <ChevronDown className="w-8 h-8" aria-hidden="true" />
      </button>
    </section>
  )
}
