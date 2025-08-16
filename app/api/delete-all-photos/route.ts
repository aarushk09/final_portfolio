import { NextResponse } from "next/server"
import { list, del } from "@vercel/blob"

export async function DELETE() {
  try {
    console.log("Starting delete all photos process...")

    // Get all blobs
    const { blobs } = await list()

    // Filter for image files only
    const imageBlobs = blobs.filter((blob) => {
      const isImage = blob.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      return isImage
    })

    console.log(`Found ${imageBlobs.length} photos to delete`)

    if (imageBlobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No photos to delete",
        deletedCount: 0,
      })
    }

    // Delete all image blobs
    const deletePromises = imageBlobs.map(async (blob) => {
      try {
        await del(blob.url)
        console.log(`Deleted: ${blob.pathname}`)
        return { success: true, pathname: blob.pathname }
      } catch (error) {
        console.error(`Failed to delete ${blob.pathname}:`, error)
        return { success: false, pathname: blob.pathname, error }
      }
    })

    const results = await Promise.allSettled(deletePromises)

    // Count successful deletions
    const successfulDeletions = results.filter((result) => result.status === "fulfilled" && result.value.success).length

    const failedDeletions = results.length - successfulDeletions

    console.log(`Deletion complete: ${successfulDeletions} successful, ${failedDeletions} failed`)

    if (failedDeletions > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to delete ${failedDeletions} photos`,
          deletedCount: successfulDeletions,
          totalCount: imageBlobs.length,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted all ${successfulDeletions} photos`,
      deletedCount: successfulDeletions,
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
