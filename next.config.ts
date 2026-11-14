import type { NextConfig } from 'next'
import { SITE_ORIGIN } from './lib/seo'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www\\.jadhavaditya\\.com' }],
        destination: `${SITE_ORIGIN}/:path*`,
        permanent: true,
      },
    ]
  },
}

export default nextConfig
