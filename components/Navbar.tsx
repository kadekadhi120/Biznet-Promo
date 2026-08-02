'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    setIsOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-slate-900/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-white font-bold text-xl"
            aria-label="Biznet Home - Halaman Utama"
          >
            <div className="p-1.5 bg-white rounded-lg">
              <Image src="/logoBiznet.png" alt="Biznet Home" width={20} height={20} className="w-5 h-5 object-contain" unoptimized />
            </div>
            <span>Biznet Home</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollTo('pricing')}
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              Paket
            </button>
            <button
              onClick={() => scrollTo('features')}
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              Keunggulan
            </button>
            <button
              onClick={() => scrollTo('register')}
              className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
            >
              Daftar Sekarang
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            'md:hidden overflow-hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800 transition-all duration-300 ease-in-out',
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 border-transparent'
          )}
          aria-hidden={!isOpen}
        >
          <div className="py-4 px-2">
            <div className="flex flex-col gap-2">
              {[
                { label: 'Paket', id: 'pricing' },
                { label: 'Keunggulan', id: 'features' },
                { label: 'Daftar', id: 'register' },
              ].map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium px-4 py-3 rounded-lg text-left"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => scrollTo('register')}
                className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-4 py-3 rounded-lg transition-colors mt-2"
              >
                Daftar Sekarang
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
