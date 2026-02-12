import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { PublicacionesProvider } from '@/lib/publicaciones-context'
import { DemoModeProvider } from '@/lib/demo-context'
import { ServiceWorkerRegistration } from '@/components/sw-registration'
import './globals.css'

const _inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: '#FF5722',
}

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Encontra Tu Mascota',
  description: 'Plataforma colaborativa para reunir mascotas perdidas con sus familias',
  generator: '',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Encontra Tu Mascota',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-icon.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-LNQ47VG50M" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-LNQ47VG50M');`}
        </Script>
      </head>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="encontratumascota-theme"
        >
          <DemoModeProvider>
            <PublicacionesProvider>
              {children}
            </PublicacionesProvider>
          </DemoModeProvider>
          <Toaster />
          <ServiceWorkerRegistration />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
