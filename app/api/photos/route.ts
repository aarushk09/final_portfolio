import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Simple in-memory cache
let cachedPhotos: any[] | null = null
let lastCacheTime = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

function getPhotos() {
  const now = Date.now()
  if (cachedPhotos && (now - lastCacheTime < CACHE_DURATION)) {
    return cachedPhotos
  }

  try {
    const photosDirectory = path.join(process.cwd(), "public", "photos")
    
    // Check if directory exists
    if (!fs.existsSync(photosDirectory)) {
      console.warn("Photos directory not found, creating it...")
      fs.mkdirSync(photosDirectory, { recursive: true })
      return []
    }

    // Read files from the directory
    const fileNames = fs.readdirSync(photosDirectory)
    
    // Filter for image files
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp)$/i
    
    const photos = fileNames
      .filter((fileName) => imageExtensions.test(fileName))
      .map((fileName) => {
        const filePath = path.join(photosDirectory, fileName)
        const stats = fs.statSync(filePath)
        
        return {
          id: fileName,
          url: `/photos/${fileName}`,
          name: fileName,
          uploadedAt: stats.birthtime.toISOString(),
          size: stats.size
        }
      })
      // Sort by creation time (newest first)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    cachedPhotos = photos
    lastCacheTime = now
    return photos
    
  } catch (error) {
    console.error("Failed to read photos directory:", error)
    return []
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "0")
    const page = parseInt(searchParams.get("page") || "1")
    
    const allPhotos = getPhotos()
    
    if (limit > 0) {
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedPhotos = allPhotos.slice(startIndex, endIndex)
      
      return NextResponse.json({ 
        photos: paginatedPhotos,
        total: allPhotos.length,
        hasMore: endIndex < allPhotos.length
      })
    }

    return NextResponse.json({ photos: allPhotos, total: allPhotos.length })
    
  } catch (error) {
    console.error("Failed to fetch photos:", error)
    return NextResponse.json({ photos: [] })
  }
}
