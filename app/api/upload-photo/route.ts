import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

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

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 })
    }

    // File size limit (10MB for Supabase free tier)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // Get file extension
    const mimeToExt: { [key: string]: string } = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    }

    const extension = mimeToExt[file.type.toLowerCase()] || "jpg"
    const timestamp = Date.now()
    const fileName = `photos/img_${timestamp}_${photoId}.${extension}`

    console.log("Preparing upload:", {
      fileName,
      extension,
      contentType: file.type,
    })

    try {
      // Try different approaches to handle the file
      console.log("Converting file to buffer...")

      // Method 1: Try using the File directly (Supabase should handle this)
      const uploadData: File | Uint8Array = file

      try {
        console.log("Attempting direct file upload...")
        const { data, error } = await supabase.storage.from("portfolio-photos").upload(fileName, uploadData, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        })

        if (error) {
          console.log("Direct file upload failed, trying buffer conversion...")
          throw error
        }

        console.log("Direct file upload successful:", data)

        // Get public URL
        const { data: urlData } = supabase.storage.from("portfolio-photos").getPublicUrl(fileName)

        return NextResponse.json({
          success: true,
          url: urlData.publicUrl,
          fileName: fileName,
          photoId: photoId,
        })
      } catch (directUploadError) {
        console.log("Direct upload failed, trying buffer method:", directUploadError)

        // Method 2: Convert to ArrayBuffer then Uint8Array
        try {
          const arrayBuffer = await file.arrayBuffer()
          const uint8Array = new Uint8Array(arrayBuffer)

          console.log("Buffer conversion successful:", {
            arrayBufferSize: arrayBuffer.byteLength,
            uint8ArraySize: uint8Array.length,
          })

          const { data, error } = await supabase.storage.from("portfolio-photos").upload(fileName, uint8Array, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
          })

          if (error) {
            console.log("Buffer upload also failed:", error)
            throw error
          }

          console.log("Buffer upload successful:", data)

          // Get public URL
          const { data: urlData } = supabase.storage.from("portfolio-photos").getPublicUrl(fileName)

          return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
            fileName: fileName,
            photoId: photoId,
          })
        } catch (bufferError) {
          console.log("Buffer method also failed, trying Blob method:", bufferError)

          // Method 3: Try using Blob
          try {
            const blob = new Blob([file], { type: file.type })

            const { data, error } = await supabase.storage.from("portfolio-photos").upload(fileName, blob, {
              contentType: file.type,
              cacheControl: "3600",
              upsert: false,
            })

            if (error) {
              console.log("Blob upload also failed:", error)
              throw error
            }

            console.log("Blob upload successful:", data)

            // Get public URL
            const { data: urlData } = supabase.storage.from("portfolio-photos").getPublicUrl(fileName)

            return NextResponse.json({
              success: true,
              url: urlData.publicUrl,
              fileName: fileName,
              photoId: photoId,
            })
          } catch (blobError) {
            console.error("All upload methods failed:", blobError)
            throw blobError
          }
        }
      }
    } catch (uploadError) {
      console.error("Upload process error:", uploadError)

      // Handle specific Supabase errors
      if (uploadError && typeof uploadError === "object" && "message" in uploadError) {
        const error = uploadError as { message: string; statusCode?: number }

        console.error("Supabase upload error details:", {
          message: error.message,
          statusCode: error.statusCode,
          error: error,
        })

        // Handle specific bucket errors
        if (
          error.message.includes("Bucket not found") ||
          error.message.includes("relation") ||
          error.message.includes("does not exist") ||
          error.message.includes("bucket")
        ) {
          return NextResponse.json(
            {
              error: "Storage bucket not found",
              details: "Please create the 'portfolio-photos' bucket in Supabase first",
              needsSetup: true,
            },
            { status: 500 },
          )
        }

        if (error.message.includes("already exists")) {
          return NextResponse.json(
            {
              error: "File already exists",
              details: "A file with this name already exists",
            },
            { status: 409 },
          )
        }
      }

      throw uploadError
    }
  } catch (error) {
    console.error("Upload error:", error)

    let errorMessage = "Failed to upload photo"
    let needsSetup = false

    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })

      if (
        error.message.includes("Bucket not found") ||
        error.message.includes("relation") ||
        error.message.includes("does not exist") ||
        error.message.includes("bucket")
      ) {
        errorMessage = "Storage bucket not found - please create the bucket first"
        needsSetup = true
      } else if (error.message.includes("getAll")) {
        errorMessage = "Supabase client error - this might be a version compatibility issue"
      } else if (error.message.includes("storage")) {
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
        needsSetup,
        isServiceError: true,
      },
      { status: 500 },
    )
  }
}
