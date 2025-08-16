import { NextResponse } from "next/server"
import { list } from "@vercel/blob"

export async function GET() {
  try {
    // List all blobs and extract hashes from metadata
    const { blobs } = await list()

    // Filter for image files and extract their hashes
    const hashes = blobs
      .filter((blob) => {
        // Check if it's an image file by extension
        const isImage = blob.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        return isImage
      })
      .map((blob) => {
        // Try to extract hash from metadata or pathname
        // The hash should be stored in the blob's metadata when uploaded
        return blob.pathname.split("_")[2]?.split(".")[0] // Extract hash from filename pattern
      })
      .filter(Boolean) // Remove any undefined values

    return NextResponse.json({ hashes })
  } catch (error) {
    console.error("Failed to fetch photo hashes:", error)
    return NextResponse.json({ hashes: [] })
  }
}
