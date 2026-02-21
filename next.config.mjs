/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // Don't fail build on ESLint errors in production
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on TypeScript errors in production
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for pdfkit in Next.js
    if (isServer) {
      config.resolve.alias.canvas = false
      config.resolve.alias.encoding = false
    }
    
    // Add fallback for fs module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    
    return config
  },
}

export default nextConfig
