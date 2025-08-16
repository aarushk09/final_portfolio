import { NextResponse } from "next/server"
import { list } from "@vercel/blob"

// Extract photo ID from filename
const extractPhotoId = (filename: string): string => {
  // Remove extension first
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "")

  // Common patterns for photo IDs:
  const patterns = [
    /^img_\d+_(IMG_\d+)/i, // Our uploaded format: img_timestamp_IMG_1234
    /^img_\d+_(DSC_\d+)/i, // Our uploaded format: img_timestamp_DSC_5678
    /^img_\d+_(PXL_\d+_\d+)/i, // Our uploaded format: img_timestamp_PXL_20240115_123456789
    /^img_\d+_(\d{8}_\d+)/, // Our uploaded format: img_timestamp_20240115_123456
    /^img_\d+_(\d{4}-\d{2}-\d{2}_\d+)/, // Our uploaded format: img_timestamp_2024-01-15_123456
    /^img_\d+_([A-Z]{2,4}\d+)/i, // Our uploaded format: img_timestamp_DCIM1234
    /^img_\d+_(\d+)/, // Our uploaded format: img_timestamp_1234567890
    /^img_\d+_(.+)/, // Our uploaded format: img_timestamp_anything_else
  ]

  for (const pattern of patterns) {
    const match = nameWithoutExt.match(pattern)
    if (match) {
      return match[1].toUpperCase()
    }
  }

  // If no pattern matches, return the full filename without extension
  return nameWithoutExt.toUpperCase()
}

export async function GET() {
  try {
    // List all blobs and extract photo IDs
    const { blobs } = await list()

    // Filter for image files and extract their photo IDs
    const photoIds = blobs
      .filter((blob) => {
        // Check if it's an image file by extension
        const isImage = blob.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        return isImage
      })
      .map((blob) => {
        // Extract photo ID from the stored filename
        const photoId = extractPhotoId(blob.pathname)
        console.log(`Blob: ${blob.pathname} -> Photo ID: ${photoId}`)
        return photoId
      })
      .filter(Boolean) // Remove any undefined values

    console.log("All existing photo IDs:", photoIds)

    return NextResponse.json({ photoIds })
  } catch (error) {
    console.error("Failed to fetch photo IDs:", error)
    return NextResponse.json({ photoIds: [] })
  }
}
