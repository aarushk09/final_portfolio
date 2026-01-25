import { NextResponse } from "next/server"

/**
 * GET /api/photos/proxy
 * 
 * This is the magic "Free SSL" fix.
 * It fetches the image from your NAS (http) and serves it from Vercel (https).
 * This prevents browsers from blocking your images due to "Mixed Content" errors.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filebrowserUrl = process.env.FILEBROWSER_URL
  const shareHash = searchParams.get('hash')
  const name = searchParams.get('name')

  if (!filebrowserUrl || !shareHash || !name) {
    return new NextResponse("Missing parameters", { status: 400 })
  }

  try {
    // Construct the direct download URL for Filebrowser
    const nasUrl = `${filebrowserUrl}/api/public/dl/${shareHash}/${encodeURIComponent(name)}`
    
    // Fetch the image from your NAS
    const response = await fetch(nasUrl)
    
    if (!response.ok) throw new Error("NAS unreachable")

    // Get the image data
    const blob = await response.blob()
    
    // Return the image to the browser with correct headers
    return new NextResponse(blob, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600", // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error("Proxy error:", error)
    return new NextResponse("Image Not Found", { status: 404 })
  }
}

