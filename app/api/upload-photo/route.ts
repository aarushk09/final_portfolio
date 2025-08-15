import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

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

    // Create a clean, safe filename
    const safeFilename = `photo_${timestamp}_${randomId}.${extension}`

    console.log("Uploading file:", safeFilename, "Type:", file.type, "Size:", file.size)

    // Upload to Vercel Blob
    const blob = await put(safeFilename, file, {
      access: "public",
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: safeFilename,
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
