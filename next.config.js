/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  experimental: {
    swcTraceProfiling: false,
  },
  // Exclude backup-archive directory from TypeScript compilation and builds
  webpack: (config) => {
    // Exclude backup-archive from module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    
    // Add rule to ignore backup-archive files completely
    config.module.rules.push({
      test: /backup-archive/,
      loader: 'ignore-loader'
    })
    
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/backup-archive/**', '**/node_modules/**']
    }
    return config
  }
}

module.exports = nextConfig
