import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

// Helper function to resize image
async function resizeImage(file: File, maxWidth: number, quality = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      const newWidth = img.width * ratio
      const newHeight = img.height * ratio

      canvas.width = newWidth
      canvas.height = newHeight

      // Draw and compress
      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      canvas.toBlob(resolve, "image/jpeg", quality)
    }

    img.src = URL.createObjectURL(file)
  })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // Create a safe filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)

    // Get file extension from MIME type as fallback
    let extension = "jpg" // default
    if (file.type === "image/png") extension = "png"
    else if (file.type === "image/webp") extension = "webp"
    else if (file.type === "image/gif") extension = "gif"
    else if (file.type === "image/jpeg") extension = "jpg"

    // Try to get extension from filename if available
    if (file.name && file.name.includes(".")) {
      const fileExt = file.name.split(".").pop()?.toLowerCase()
      if (fileExt && ["jpg", "jpeg", "png", "webp", "gif"].includes(fileExt)) {
        extension = fileExt
      }
    }

    // Create filenames
    const originalFilename = `photo_${timestamp}_${randomId}.${extension}`
    const thumbnailFilename = `thumb_${timestamp}_${randomId}.jpg`

    console.log("Uploading files:", { originalFilename, thumbnailFilename })

    // Upload original image
    const originalBlob = await put(originalFilename, file, {
      access: "public",
    })

    // Create and upload thumbnail (this will be done on client side for now)
    // For server-side image processing, we'd need a different approach

    return NextResponse.json({
      success: true,
      url: originalBlob.url,
      thumbnailUrl: originalBlob.url, // For now, same as original
      filename: originalFilename,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: "Failed to upload photo",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
