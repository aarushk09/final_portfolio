import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const photoId = formData.get("photoId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!photoId) {
      return NextResponse.json({ error: "No photo ID provided" }, { status: 400 })
    }

    // More flexible file type validation
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"]
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    // File size limit (10MB for Supabase free tier)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // Get file extension more reliably
    let extension = "jpg" // default
    const mimeToExt: { [key: string]: string } = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/heic": "jpg", // Convert HEIC to JPG
      "image/heif": "jpg", // Convert HEIF to JPG
    }

    extension = mimeToExt[file.type.toLowerCase()] || "jpg"

    // Create filename with photo ID for duplicate detection
    const timestamp = Date.now()
    const fileName = `photos/img_${timestamp}_${photoId}.${extension}`

    console.log("Uploading to Supabase:", {
      fileName,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      photoId: photoId,
    })

    // Convert File to ArrayBuffer for Supabase
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("portfolio-photos").upload(fileName, fileBuffer, {
      contentType: file.type,
      metadata: {
        photoId: photoId,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    })

    if (error) {
      console.error("Supabase upload error:", error)
      throw new Error(error.message)
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("portfolio-photos").getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: fileName,
      photoId: photoId,
    })
  } catch (error) {
    console.error("Upload error:", error)

    // Handle specific Supabase errors
    let errorMessage = "Failed to upload photo"
    if (error instanceof Error) {
      if (error.message.includes("storage")) {
        errorMessage = "Storage service error - please try again"
      } else if (error.message.includes("quota")) {
        errorMessage = "Storage quota exceeded"
      } else if (error.message.includes("network")) {
        errorMessage = "Network error - please try again"
      } else if (error.message.includes("size")) {
        errorMessage = "File too large"
      } else if (error.message.includes("type")) {
        errorMessage = "Unsupported file type"
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
        isServiceError:
          error instanceof Error &&
          (error.message.includes("storage") || error.message.includes("quota") || error.message.includes("billing")),
      },
      { status: 500 },
    )
  }
}
