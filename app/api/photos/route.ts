import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // List all files in the photos folder
    const { data, error } = await supabase.storage.from("portfolio-photos").list("photos", {
      limit: 100,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    })

    if (error) {
      console.error("Failed to fetch photos from Supabase:", error)
      return NextResponse.json({ photos: [] })
    }

    // Filter for image files and get public URLs
    const photos = data
      .filter((file) => {
        const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        return isImage && file.name !== ".emptyFolderPlaceholder"
      })
      .map((file) => {
        const { data: urlData } = supabase.storage.from("portfolio-photos").getPublicUrl(`photos/${file.name}`)

        return {
          id: `photos/${file.name}`,
          url: urlData.publicUrl,
          uploadedAt: file.created_at || new Date().toISOString(),
        }
      })

    return NextResponse.json({ photos })
  } catch (error) {
    console.error("Failed to fetch photos:", error)
    return NextResponse.json({ photos: [] })
  }
}
