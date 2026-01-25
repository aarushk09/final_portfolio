/**
 * Example: Advanced Next.js Configuration for Filebrowser Integration
 * 
 * This shows optional configurations you might need for:
 * - Custom headers for CORS
 * - Image optimization proxying
 * - Rewrite rules for Filebrowser paths
 * 
 * Most users won't need this - the basic API proxy is sufficient!
 */

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Your existing config...
  
  // Optional: Add CORS headers to your API routes (if needed for external access)
  async headers() {
    return [
      {
        // Apply to all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGIN || '*', // Restrict in production!
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },

  // Optional: Configure image domains for Next.js Image component
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'your-nas-ip', // Replace with your NAS IP
        port: '8080',
        pathname: '/api/**',
      },
      // If using a domain with HTTPS
      {
        protocol: 'https',
        hostname: 'nas.yourdomain.com',
        pathname: '/api/**',
      },
    ],
  },

  // Optional: Add rewrites if you want cleaner URLs
  // Example: /nas-photos/abc.jpg -> calls Filebrowser API
  async rewrites() {
    return [
      {
        source: '/nas-photos/:path*',
        destination: '/api/photos/:path*',
      },
    ]
  },
}

export default nextConfig

/**
 * USAGE EXAMPLES:
 * 
 * 1. Using Next.js Image component with Filebrowser:
 * 
 * import Image from 'next/image'
 * 
 * <Image 
 *   src="http://your-nas-ip:8080/api/raw/my_data/portfolio_pics/photo.jpg?auth=token"
 *   alt="Photo"
 *   width={800}
 *   height={600}
 * />
 * 
 * 2. Using the API proxy:
 * 
 * const response = await fetch('/api/photos')
 * const { photos } = await response.json()
 * 
 * photos.map(photo => (
 *   <img src={photo.url} alt={photo.name} />
 * ))
 * 
 * 3. With rewrites enabled:
 * 
 * <img src="/nas-photos/photo.jpg" alt="Photo" />
 * // Automatically proxied through your API
 */

