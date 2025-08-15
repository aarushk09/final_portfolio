import { type NextRequest, NextResponse } from "next/server"
import { del } from "@vercel/blob"

export async function DELETE(request: NextRequest) {
  try {
    const { photoId } = await request.json()

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID is required" }, { status: 400 })
    }

    // Delete the photo from Vercel Blob
    await del(photoId)

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
