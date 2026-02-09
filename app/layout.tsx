import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { PublicacionesProvider } from '@/lib/publicaciones-context'
import { ServiceWorkerRegistration } from '@/components/sw-registration'
import './globals.css'

const _inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: '#FF5722',
}

export const metadata: Metadata = {
  title: 'Encontra Tu Mascota',
  description: 'Plataforma colaborativa para reunir mascotas perdidas con sus familias',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Encontra Tu Mascota',
  },
  icons: {
    icon: '/favicon.svg',
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
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="encontratumascota-theme"
        >
          <PublicacionesProvider>
            {children}
          </PublicacionesProvider>
          <Toaster />
          <ServiceWorkerRegistration />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
