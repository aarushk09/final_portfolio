import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function DELETE(request: NextRequest) {
  try {
    const { photoId } = await request.json()

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID is required" }, { status: 400 })
    }

    console.log("Deleting photo:", photoId)

    // Delete the photo from Supabase Storage
    const { error } = await supabase.storage.from("portfolio-photos").remove([photoId])

    if (error) {
      console.error("Supabase delete error:", error)
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json(
      {
        error: "Failed to delete photo",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
