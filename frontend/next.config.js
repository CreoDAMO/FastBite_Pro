
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:4000',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://0.0.0.0:4000',
    NEXT_PUBLIC_COINBASE_APP_ID: process.env.NEXT_PUBLIC_COINBASE_APP_ID,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  },
  images: {
    domains: ['localhost', '0.0.0.0'],
  },
}

module.exports = nextConfig
