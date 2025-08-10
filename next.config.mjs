const nextConfig = {
  // Configuration pour le build standalone optimisé pour Docker
  output: 'standalone',
  
  // Images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.homecyclhome.site',
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