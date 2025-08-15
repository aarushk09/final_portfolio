import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Try to fetch photos from blob storage
    const response = await fetch(`https://blob.vercel-storage.com/photos.json`)

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      // File doesn't exist yet, return empty array
      return NextResponse.json({ photos: [] })
    }
  } catch (error) {
    console.error("Failed to fetch photos:", error)
    // Return empty array if there's any error
    return NextResponse.json({ photos: [] })
  }
}
