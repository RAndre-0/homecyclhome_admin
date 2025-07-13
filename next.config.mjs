const nextConfig = {
  images: {
    domains: ['127.0.0.1', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/uploads/**',
      },
    ],
  },
}

export default nextConfig
