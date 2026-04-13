import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { PublicacionesProvider } from "@/lib/publicaciones-context";
import { AuthProvider } from "@/lib/auth-context";
import { ServiceWorkerRegistration } from "@/components/sw-registration";
import { AppSplashScreen } from "@/components/app-splash-screen";
import { GlobalModals } from "@/components/global-modals";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#FF5722",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

const GA_TRACKING_ID = "G-LNQ47VG50M";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Encontra Tu Mascota",
  description:
    "Plataforma colaborativa para reunir mascotas perdidas, encontradas y en adopción con sus familias",
  keywords: [
    "mascotas perdidas",
    "perros encontrados",
    "gatos perdidos",
    "reunir mascotas",
    "mascotas",
    "Argentina",
  ],
  generator: "Next.js",
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: "Encontra Tu Mascota",
    title: "Encontra Tu Mascota",
    description:
      "Plataforma colaborativa para reunir mascotas perdidas, encontradas y en adopción con sus familias",
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: "Encontra Tu Mascota Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Encontra Tu Mascota",
    description:
      "Plataforma colaborativa para reunir mascotas perdidas, encontradas y en adopción con sus familias",
    images: [`${siteUrl}/logo.png`],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Encontra Tu Mascota",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "Encontra Tu Mascota",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning dir="ltr">
      <head>
        {process.env.NODE_ENV === "development" && (
          <>
            <Script
              src="https://unpkg.com/react-grab@0.1.29/dist/index.global.js"
              strategy="beforeInteractive"
              async
            />
            <Script id="sw-emergency-reset" strategy="beforeInteractive">
              {`(function () {
                try {
                  if (!('serviceWorker' in navigator)) return;
                  navigator.serviceWorker.getRegistrations().then(function (registrations) {
                    registrations.forEach(function (registration) {
                      registration.unregister();
                    });
                  });
                  if ('caches' in window) {
                    caches.keys().then(function (keys) {
                      keys.forEach(function (key) {
                        caches.delete(key);
                      });
                    });
                  }
                } catch (e) {}
              })();`}
            </Script>
          </>
        )}
        {/* SEO Meta Tags */}
        <meta name="theme-color" content="#FF5722" />
        <link rel="canonical" href={siteUrl} />
        {/* Organization Schema */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Encontra Tu Mascota",
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              description:
                "Plataforma colaborativa para reunir mascotas perdidas, encontradas y en adopción con sus familias",
              sameAs: [
                "https://www.facebook.com/encontratumascota",
                "https://twitter.com/encontratumascota",
                "https://instagram.com/encontratumascota",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Customer Support",
                email: "contacto@encontratumascota.ar",
              },
            }),
          }}
        />
        {/* Analytics */}
        {process.env.NODE_ENV === "production" && (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            <link rel="preconnect" href="https://www.google-analytics.com" />
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              strategy="lazyOnload"
            />
            <Script id="gtag-init" strategy="lazyOnload">
              {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', { anonymize_ip: true });`}
            </Script>
          </>
        )}
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <AppSplashScreen />
        {/* Skip link for keyboard navigation */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:bg-primary focus:text-primary-foreground focus:p-4 focus:fixed focus:top-0 focus:left-0 focus:z-50"
        >
          Ir al contenido principal
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="encontratumascota-theme"
        >
          <PublicacionesProvider>
            <AuthProvider>
              <GlobalModals />
              {children}
            </AuthProvider>
          </PublicacionesProvider>
          <Toaster />
          <ServiceWorkerRegistration />
        </ThemeProvider>
        {process.env.NODE_ENV === "production" ? <Analytics /> : null}
      </body>
    </html>
  );
}
