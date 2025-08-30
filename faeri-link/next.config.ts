import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Workspace root configuration to avoid inference warnings
  outputFileTracingRoot: __dirname,

  // Force SWC transforms to resolve next/font conflict with Babel
  experimental: {
    forceSwcTransforms: true,
  },

  // Static Generation and Performance Optimizations
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,

  // Static generation for public pages
  output: 'standalone',

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googletagmanager.com *.google-analytics.com;
              style-src 'self' 'unsafe-inline' *.googlefonts.com;
              img-src 'self' data: https: *.google-analytics.com *.googletagmanager.com;
              font-src 'self' *.googlefonts.com *.gstatic.com;
              connect-src 'self' *.supabase.co *.google-analytics.com;
              frame-src 'self' *.google.com;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
            `.replace(/\s+/g, ' ').trim(),
          },
          // Performance headers
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // API routes - no caching
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all'
    }

    // Note: Custom babel-loader removed to allow Next.js built-in TypeScript handling

    return config
  },

  // External packages for server components
  serverExternalPackages: ['@supabase/supabase-js'],
}

export default nextConfig
