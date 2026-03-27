import { dirname } from "path"
import { fileURLToPath } from "url"
import withBundleAnalyzer from "@next/bundle-analyzer"

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */

const baseConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "loremflickr.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      {
        protocol: "https",
        hostname: "placekitten.com",
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development'
    // Next.js app router needs inline bootstrap scripts to hydrate client components.
    const googleScriptHosts = "https://www.google.com https://www.gstatic.com"
    const scriptSrc = isDev
      ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://va.vercel-scripts.com https://vercel.live https://static.cloudflareinsights.com https://unpkg.com ${googleScriptHosts}`
      : `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com https://vercel.live https://static.cloudflareinsights.com https://unpkg.com ${googleScriptHosts}`
    const scriptSrcElem = `script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com https://vercel.live https://static.cloudflareinsights.com https://unpkg.com ${googleScriptHosts}`
    const connectSrc = "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://va.vercel-scripts.com https://vercel.live https://www.google.com"
    const frameSrc = `frame-src 'self' https://www.google.com https://accounts.google.com`

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; base-uri 'self'; frame-ancestors 'self'; object-src 'none'; img-src 'self' https: data: blob:; media-src *; ${scriptSrc}; ${scriptSrcElem}; ${connectSrc}; ${frameSrc}; style-src 'self' 'unsafe-inline'; font-src 'self' data: https:;`
          },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
        ]
      }
    ];
  },
}

const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

export default withBundleAnalyzerConfig(baseConfig)
