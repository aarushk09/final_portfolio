import { NextResponse } from "next/server"
import { FilebrowserClient, getFallbackImages } from "@/lib/filebrowser"

/**
 * GET /api/photos
 * 
 * Fetches portfolio photos from self-hosted Filebrowser instance
 * Falls back to local placeholder images if Filebrowser is unavailable
 * 
 * Two modes of operation:
 * 1. Authenticated API calls (using token or credentials)
 * 2. Public share URLs (no authentication needed for visitors)
 */
export async function GET() {
  try {
    // Check if we're using public share mode or authenticated mode
    const usePublicShare = process.env.FILEBROWSER_PUBLIC_SHARE_ENABLED === 'true'
    const filebrowserUrl = process.env.FILEBROWSER_URL!
    
    if (!filebrowserUrl) {
      console.warn('FILEBROWSER_URL not configured, using fallback images')
      return NextResponse.json({ photos: getFallbackImages() })
    }

    // MODE 1: Public Share (Recommended for production - no auth needed per request)
    if (usePublicShare) {
      const shareHash = process.env.FILEBROWSER_SHARE_HASH!
      
      if (!shareHash) {
        console.warn('FILEBROWSER_SHARE_HASH not configured, using fallback')
        return NextResponse.json({ photos: getFallbackImages() })
      }

      try {
        // Fetch files from public share
        const files = await FilebrowserClient.listPublicShareFiles(
          `${filebrowserUrl}/share/${shareHash}`
        )

        // Filter and map to image files
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp)$/i
        const photos = files
          .filter((file) => imageExtensions.test(file.name))
          .map((file) => ({
            id: file.path,
            url: `/api/photos/proxy?hash=${shareHash}&name=${encodeURIComponent(file.name)}`,
            uploadedAt: file.modified,
            name: file.name,
            size: file.size,
          }))
          .sort((a, b) => 
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          )

        return NextResponse.json({ photos })
      } catch (error) {
        console.error('Failed to fetch from public share, using fallback:', error)
        return NextResponse.json({ photos: getFallbackImages() })
      }
    }

    // MODE 2: Authenticated API calls (uses token or username/password)
    const filebrowserClient = new FilebrowserClient({
      baseUrl: filebrowserUrl,
      token: process.env.FILEBROWSER_TOKEN,
      username: process.env.FILEBROWSER_USERNAME,
      password: process.env.FILEBROWSER_PASSWORD,
    })

    // Health check before attempting to fetch
    const isHealthy = await filebrowserClient.healthCheck()
    if (!isHealthy) {
      console.warn('Filebrowser health check failed, using fallback images')
      return NextResponse.json({ photos: getFallbackImages() })
    }

    // Fetch photos from the configured directory
    const directoryPath = process.env.FILEBROWSER_PHOTOS_PATH || '/my_data/portfolio_pics'
    const photos = await filebrowserClient.getPortfolioPhotos(directoryPath)

    return NextResponse.json({ photos })

  } catch (error) {
    console.error('Failed to fetch photos from Filebrowser:', error)
    
    // Return fallback images when Filebrowser is offline/unreachable
    return NextResponse.json({ 
      photos: getFallbackImages(),
      error: 'Using fallback images - Filebrowser temporarily unavailable'
    })
  }
}

/**
 * POST /api/photos/create-share
 * 
 * Helper endpoint to create a public share for your portfolio folder
 * Call this once to generate a persistent share hash
 * 
 * Usage: POST /api/photos with body { "createShare": true }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (body.createShare) {
      const filebrowserUrl = process.env.FILEBROWSER_URL!
      const directoryPath = process.env.FILEBROWSER_PHOTOS_PATH || '/my_data/portfolio_pics'

      const client = new FilebrowserClient({
        baseUrl: filebrowserUrl,
        token: process.env.FILEBROWSER_TOKEN,
        username: process.env.FILEBROWSER_USERNAME,
        password: process.env.FILEBROWSER_PASSWORD,
      })

      const shareUrl = await client.createPublicShare(directoryPath)
      const shareHash = shareUrl.split('/share/')[1]

      return NextResponse.json({ 
        shareUrl,
        shareHash,
        message: 'Add this hash to your .env.local as FILEBROWSER_SHARE_HASH'
      })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Failed to create share:', error)
    return NextResponse.json({ error: 'Failed to create share' }, { status: 500 })
  }
}
