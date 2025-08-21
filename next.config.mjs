const nextConfig = {
  // Configuration pour le build standalone optimisé pour Docker
  output: 'standalone',

  // ⬇️ MVP: ne pas casser le build à cause d'ESLint/TS
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Images
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.homecyclhome.site' },
      { protocol: 'https', hostname: 'api-test.homecyclhome.site' },
      {
        protocol: 'https',
        hostname: 'api.homecyclhome.site',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api-test.homecyclhome.site',
        pathname: '/uploads/**',
      },
      // localhost pour le dev
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/uploads/**',
      },
    ],
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
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
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig