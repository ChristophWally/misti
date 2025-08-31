/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  experimental: {
    swcTraceProfiling: false,
  }
}

module.exports = nextConfig
