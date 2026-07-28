import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import CursorGlow from '@/components/CursorGlow'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'Biznet Home'
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://biznethome.id'

export const metadata: Metadata = {
  title: {
    default: `${brandName} — Internet Fiber Rumahan Cepat & Stabil`,
    template: `%s | ${brandName}`,
  },
  description:
    'Nikmati koneksi internet fiber rumahan dengan kecepatan hingga 500Mbps. Pilih paket yang sesuai kebutuhan keluarga Anda. Daftar sekarang!',
  keywords: [
    'internet fiber rumahan',
    'biznet home',
    'paket internet murah',
    'internet cepat',
    'broadband',
    'fiber optic',
  ],
  authors: [{ name: brandName }],
  creator: brandName,
  metadataBase: new URL(appUrl),
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: appUrl,
    title: `${brandName} — Internet Fiber Rumahan Cepat & Stabil`,
    description:
      'Nikmati koneksi internet fiber rumahan dengan kecepatan hingga 500Mbps. Pilih paket yang sesuai kebutuhan keluarga Anda.',
    siteName: brandName,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${brandName} — Paket Internet Fiber`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${brandName} — Internet Fiber Rumahan`,
    description: 'Paket internet fiber rumahan kecepatan hingga 500Mbps.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CursorGlow />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 5000,
            style: {
              borderRadius: '12px',
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#f8fafc' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f8fafc' },
            },
          }}
        />
      </body>
    </html>
  )
}
