import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { crypto } from "crypto"

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

    // Upload to Vercel Blob with unique filename
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    })

    // Save photo metadata to another blob file (JSON)
    const photoData = {
      id: crypto.randomUUID(),
      url: blob.url,
      uploadedAt: new Date().toISOString(),
    }

    // Get existing photos from blob storage
    let photos = []
    try {
      const photosResponse = await fetch(
        `${process.env.BLOB_READ_WRITE_TOKEN ? "https://blob.vercel-storage.com" : ""}/photos.json`,
      )
      if (photosResponse.ok) {
        const existingData = await photosResponse.json()
        photos = existingData.photos || []
      }
    } catch (error) {
      // File doesn't exist yet, start with empty array
      photos = []
    }

    // Add new photo to beginning
    photos.unshift(photoData)

    // Save updated photos list back to blob storage
    const photosBlob = new Blob([JSON.stringify({ photos }, null, 2)], {
      type: "application/json",
    })

    await put("photos.json", photosBlob, {
      access: "public",
      addRandomSuffix: false,
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      id: photoData.id,
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
