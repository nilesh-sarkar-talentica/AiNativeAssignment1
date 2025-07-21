/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable React 19 features
    reactCompiler: false, // Can be enabled when React 19 compiler is stable
  },
  typescript: {
    // Type checking during build
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLint during build
    ignoreDuringBuilds: false,
  },
  images: {
    // Image optimization domains
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
