import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET() {
  try {
    const photosPath = join(process.cwd(), "data", "photos.json")

    try {
      const data = await readFile(photosPath, "utf-8")
      const photos = JSON.parse(data)
      return NextResponse.json(photos)
    } catch (error) {
      // File doesn't exist yet, return empty array
      return NextResponse.json({ photos: [] })
    }
  } catch (error) {
    console.error("Failed to fetch photos:", error)
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}
