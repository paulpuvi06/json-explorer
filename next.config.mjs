import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  webpack: (config, { isServer }) => {
    // Fix for vendor chunk issues in static export
    if (isServer) {
      config.externals = [...(config.externals || []), 'react-remove-scroll']
    }
    
    return config
  },
}

export default nextConfig
