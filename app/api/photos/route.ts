import { NextResponse } from "next/server"
import { list } from "@vercel/blob"

export async function GET() {
  try {
    // List all blobs and filter for images
    const { blobs } = await list()

    // Filter for image files and sort by upload time (newest first)
    const photos = blobs
      .filter((blob) => {
        // Check if it's an image file by extension or content type
        const isImage = blob.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        return isImage
      })
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .map((blob) => ({
        id: blob.pathname,
        url: blob.url,
        uploadedAt: blob.uploadedAt,
      }))

    return NextResponse.json({ photos })
  } catch (error) {
    console.error("Failed to fetch photos:", error)
    return NextResponse.json({ photos: [] })
  }
}
