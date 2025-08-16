import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // List all files in the photos folder
    const { data, error } = await supabase.storage.from("portfolio-photos").list("photos", {
      limit: 1000,
      offset: 0,
    })

    if (error) {
      console.error("Failed to fetch photo IDs from Supabase:", error)
      return NextResponse.json({ photoIds: [] })
    }

    // Extract photo IDs from filenames
    const photoIds = data
      .filter((file) => {
        const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        return isImage && file.name !== ".emptyFolderPlaceholder"
      })
      .map((file) => {
        // Extract photo ID from filename pattern: img_timestamp_PHOTOID.ext
        const match = file.name.match(/img_\d+_(.+)\.(jpg|jpeg|png|gif|webp)$/i)
        return match ? match[1] : null
      })
      .filter(Boolean) // Remove null values

    return NextResponse.json({ photoIds })
  } catch (error) {
    console.error("Failed to fetch photo IDs:", error)
    return NextResponse.json({ photoIds: [] })
  }
}
