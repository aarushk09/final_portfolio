import { supabase } from "@/lib/supabase"

async function setupSupabaseStorage() {
  try {
    console.log("🚀 Setting up Supabase storage...")

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("❌ Error listing buckets:", listError)
      return
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === "portfolio-photos")

    if (!bucketExists) {
      console.log("📦 Creating 'portfolio-photos' bucket...")

      // Create the bucket
      const { data, error } = await supabase.storage.createBucket("portfolio-photos", {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        fileSizeLimit: 10485760, // 10MB
      })

      if (error) {
        console.error("❌ Error creating bucket:", error)
        return
      }

      console.log("✅ Bucket created successfully!")
    } else {
      console.log("✅ Bucket already exists!")
    }

    // Test upload to verify everything works
    console.log("🧪 Testing bucket access...")

    const testFile = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]) // PNG header
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("portfolio-photos")
      .upload("test/test.png", testFile, {
        contentType: "image/png",
      })

    if (uploadError) {
      console.error("❌ Error testing upload:", uploadError)
      return
    }

    console.log("✅ Upload test successful!")

    // Clean up test file
    await supabase.storage.from("portfolio-photos").remove(["test/test.png"])
    console.log("🧹 Cleaned up test file")

    console.log("🎉 Supabase storage setup complete!")
  } catch (error) {
    console.error("❌ Setup failed:", error)
  }
}

// Run the setup
setupSupabaseStorage()
