import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { writeFile, readFile } from "fs/promises"
import { join } from "path"

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

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    })

    // Save photo metadata
    const photoData = {
      id: crypto.randomUUID(),
      url: blob.url,
      uploadedAt: new Date().toISOString(),
    }

    // Read existing photos
    const photosPath = join(process.cwd(), "data", "photos.json")
    let photos = []

    try {
      const existingData = await readFile(photosPath, "utf-8")
      photos = JSON.parse(existingData).photos || []
    } catch (error) {
      // File doesn't exist yet, start with empty array
      photos = []
    }

    // Add new photo
    photos.unshift(photoData) // Add to beginning for newest first

    // Write back to file
    await writeFile(photosPath, JSON.stringify({ photos }, null, 2))

    return NextResponse.json({
      success: true,
      url: blob.url,
      id: photoData.id,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 })
  }
}
