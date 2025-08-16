import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
  try {
    const { photoId } = await request.json()

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID is required" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 })
    }

    console.log("Deleting photo:", photoId)

    // Delete using REST API
    const deleteUrl = `${supabaseUrl}/storage/v1/object/portfolio-photos/${photoId}`

    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Delete failed:", response.status, errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
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
