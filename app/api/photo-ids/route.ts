import { NextResponse } from "next/server"
import { list } from "@vercel/blob"

export async function GET() {
  try {
    // List all blobs with photos prefix
    const { blobs } = await list({
      prefix: "photos/",
      limit: 1000,
    })

    // Extract photo IDs from filenames
    const photoIds = blobs
      .filter((blob) => {
        const isImage = blob.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        return isImage
      })
      .map((blob) => {
        // Extract photo ID from filename pattern: photos/img_timestamp_PHOTOID.ext
        const match = blob.pathname.match(/photos\/img_\d+_(.+)\.(jpg|jpeg|png|gif|webp)$/i)
        return match ? match[1] : null
      })
      .filter(Boolean) // Remove null values

    return NextResponse.json({ photoIds })
  } catch (error) {
    console.error("Failed to fetch photo IDs:", error)
    return NextResponse.json({ photoIds: [] })
  }
}
