import { type NextRequest, NextResponse } from "next/server"

// Sanitize filename to remove special characters that Supabase doesn't like
function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace special chars with underscore
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores
    .toLowerCase()
}

// Sanitize photo ID to ensure it's safe for filenames
function sanitizePhotoId(photoId: string): string {
  return photoId
    .replace(/[^a-zA-Z0-9]/g, "_") // Replace non-alphanumeric with underscore
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores
    .toUpperCase()
    .substring(0, 20) // Limit length
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const photoId = formData.get("photoId") as string

    console.log("Received upload request:", {
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      photoId,
    })

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!photoId) {
      return NextResponse.json({ error: "No photo ID provided" }, { status: 400 })
    }

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          error: "Missing Supabase configuration",
          details: "SUPABASE_SERVICE_ROLE_KEY is required",
          needsSetup: true,
        },
        { status: 500 },
      )
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 })
    }

    // File size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // Sanitize inputs to prevent pattern errors
    const originalName = file.name
    const sanitizedOriginalName = sanitizeFileName(originalName)
    const sanitizedPhotoId = sanitizePhotoId(photoId)

    // Get file extension safely
    const extension = sanitizedOriginalName.split(".").pop()?.toLowerCase() || "jpg"
    const timestamp = Date.now()

    // Create a safe filename that Supabase will accept
    const fileName = `img_${timestamp}_${sanitizedPhotoId}.${extension}`
    const fullPath = `photos/${fileName}`

    console.log("Sanitized upload info:", {
      originalName,
      sanitizedOriginalName,
      originalPhotoId: photoId,
      sanitizedPhotoId,
      fileName,
      fullPath,
      fileSize: file.size,
      fileType: file.type,
    })

    // Convert file to ArrayBuffer
    const fileBuffer = await file.arrayBuffer()

    // Upload directly to Supabase Storage REST API
    const uploadUrl = `${supabaseUrl}/storage/v1/object/portfolio-photos/${fullPath}`

    console.log("Upload URL:", uploadUrl)

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": file.type,
        "x-upsert": "false",
        "cache-control": "3600",
      },
      body: fileBuffer,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error("Upload failed:", {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        error: errorText,
        url: uploadUrl,
        fileName: fullPath,
      })

      if (uploadResponse.status === 404) {
        return NextResponse.json(
          {
            error: "Storage bucket not found",
            details: "Create 'portfolio-photos' bucket in Supabase dashboard",
            needsSetup: true,
          },
          { status: 500 },
        )
      }

      if (uploadResponse.status === 403) {
        return NextResponse.json(
          {
            error: "Permission denied",
            details: "Check RLS policies or use service role key",
            needsRLSFix: true,
          },
          { status: 500 },
        )
      }

      if (uploadResponse.status === 400 && errorText.includes("pattern")) {
        return NextResponse.json(
          {
            error: "Invalid filename pattern",
            details: `Filename "${fullPath}" contains invalid characters. Original: "${originalName}"`,
            isServiceError: true,
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          error: "Upload failed",
          details: `HTTP ${uploadResponse.status}: ${errorText}`,
          isServiceError: true,
        },
        { status: 500 },
      )
    }

    const uploadResult = await uploadResponse.json()
    console.log("Upload successful:", uploadResult)

    // Get public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/portfolio-photos/${fullPath}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fullPath,
      photoId: sanitizedPhotoId,
      originalName: originalName,
    })
  } catch (error) {
    console.error("Upload error:", error)

    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
        isServiceError: true,
      },
      { status: 500 },
    )
  }
}
