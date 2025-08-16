import { NextResponse } from "next/server"

export async function DELETE() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 })
    }

    console.log("Starting delete all photos process...")

    // List files first
    const listUrl = `${supabaseUrl}/storage/v1/object/list/portfolio-photos`

    const listResponse = await fetch(listUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prefix: "photos/",
        limit: 1000,
        offset: 0,
      }),
    })

    if (!listResponse.ok) {
      throw new Error(`Failed to list photos: ${listResponse.status}`)
    }

    const files = await listResponse.json()

    // Filter for image files only
    const imageFiles = files.filter((file: any) => {
      const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      return isImage && file.name !== ".emptyFolderPlaceholder"
    })

    console.log(`Found ${imageFiles.length} photos to delete`)

    if (imageFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No photos to delete",
        deletedCount: 0,
      })
    }

    // Delete all photos using REST API
    const filePaths = imageFiles.map((file: any) => `photos/${file.name}`)

    const deleteUrl = `${supabaseUrl}/storage/v1/object/portfolio-photos`

    const deleteResponse = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prefixes: filePaths,
      }),
    })

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text()
      throw new Error(`Delete failed: ${deleteResponse.status} ${errorText}`)
    }

    console.log(`Successfully deleted ${imageFiles.length} photos`)

    return NextResponse.json({
      success: true,
      message: `Successfully deleted all ${imageFiles.length} photos`,
      deletedCount: imageFiles.length,
    })
  } catch (error) {
    console.error("Delete all photos error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete photos",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
