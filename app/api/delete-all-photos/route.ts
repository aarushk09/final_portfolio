import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function DELETE() {
  try {
    console.log("Starting delete all photos process...")

    // List all files in the photos folder
    const { data, error } = await supabase.storage.from("portfolio-photos").list("photos", {
      limit: 1000,
      offset: 0,
    })

    if (error) {
      console.error("Failed to list photos:", error)
      throw new Error(error.message)
    }

    // Filter for image files only
    const imageFiles = data.filter((file) => {
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

    // Create array of file paths to delete
    const filePaths = imageFiles.map((file) => `photos/${file.name}`)

    // Delete all photos at once
    const { error: deleteError } = await supabase.storage.from("portfolio-photos").remove(filePaths)

    if (deleteError) {
      console.error("Failed to delete photos:", deleteError)
      throw new Error(deleteError.message)
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
