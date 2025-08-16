import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

    // Create a fresh Supabase client with service role key
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

    // Create admin client directly here
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get file extension
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const timestamp = Date.now()
    const fileName = `photos/img_${timestamp}_${photoId}.${extension}`

    console.log("Uploading with fresh admin client:", {
      fileName,
      fileSize: file.size,
      fileType: file.type,
    })

    // Convert file to bytes
    const bytes = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(bytes)

    // Upload using the fresh admin client
    const { data, error } = await supabaseAdmin.storage.from("portfolio-photos").upload(fileName, fileBuffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Upload failed:", error)

      if (error.message.includes("Bucket not found")) {
        return NextResponse.json(
          {
            error: "Storage bucket not found",
            details: "Create 'portfolio-photos' bucket in Supabase dashboard",
            needsSetup: true,
          },
          { status: 500 },
        )
      }

      return NextResponse.json(
        {
          error: "Upload failed",
          details: error.message,
          isServiceError: true,
        },
        { status: 500 },
      )
    }

    console.log("Upload successful:", data)

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage.from("portfolio-photos").getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: fileName,
      photoId: photoId,
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
