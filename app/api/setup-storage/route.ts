import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST() {
  try {
    console.log("🚀 Setting up Supabase storage...")

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to check buckets",
          details: listError.message,
        },
        { status: 500 },
      )
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === "portfolio-photos")

    if (!bucketExists) {
      console.log("Creating 'portfolio-photos' bucket...")

      // Create the bucket
      const { error: createError } = await supabase.storage.createBucket("portfolio-photos", {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"],
        fileSizeLimit: 10485760, // 10MB
      })

      if (createError) {
        console.error("Error creating bucket:", createError)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create bucket",
            details: createError.message,
          },
          { status: 500 },
        )
      }

      console.log("✅ Bucket created successfully!")
    }

    // Test upload to verify everything works
    const testFile = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]) // PNG header
    const { error: uploadError } = await supabase.storage.from("portfolio-photos").upload("test/test.png", testFile, {
      contentType: "image/png",
    })

    if (uploadError) {
      console.error("Error testing upload:", uploadError)
      return NextResponse.json(
        {
          success: false,
          error: "Bucket created but upload test failed",
          details: uploadError.message,
        },
        { status: 500 },
      )
    }

    // Clean up test file
    await supabase.storage.from("portfolio-photos").remove(["test/test.png"])

    return NextResponse.json({
      success: true,
      message: bucketExists ? "Storage already configured" : "Storage setup complete",
      bucketExists,
    })
  } catch (error) {
    console.error("Setup failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Setup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
