import { createServiceClient } from '@/lib/supabase/server'
import type { Promo } from '@/lib/types'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import PricingSection from '@/components/PricingSection'
import RegistrationForm from '@/components/RegistrationForm'
import LenisProvider from '@/components/LenisProvider'
import ScrollReveal from '@/components/ScrollReveal'
import Image from 'next/image'

// ISR: revalidate setiap 60 detik agar perubahan admin langsung terlihat
export const revalidate = 60

async function getPromos(): Promise<Promo[]> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('promos')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching promos:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Failed to fetch promos:', err)
    return []
  }
}

export default async function HomePage() {
  const promos = await getPromos()

  return (
    <LenisProvider>
      <Navbar />

      <main id="main-content">
        {/* Hero */}
        <HeroSection />

        {/* Pricing */}
        <PricingSection promos={promos} />

        {/* Features */}
        <FeaturesSection />

        {/* Registration Form */}
        <RegistrationForm promos={promos} />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <Image src="/logoBiznet.png" alt="Biznet Home" width={20} height={20} className="w-5 h-5 object-contain" unoptimized />
                </div>
                <div>
                  <p className="text-white font-bold text-lg leading-none">
                    Biznet Home
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Internet Fiber Rumahan
                  </p>
                </div>
              </div>

              <nav aria-label="Footer navigation">
                <ul className="flex flex-wrap gap-6 text-sm">
                  {[
                    { label: 'Paket', href: '#pricing' },
                    { label: 'Keunggulan', href: '#features' },
                    { label: 'Daftar', href: '#register' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="hover:text-white transition-colors"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <p className="text-sm text-slate-500">
                &copy; {new Date().getFullYear()} Biznet Home. All rights reserved.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </footer>
    </LenisProvider>
  )
}
