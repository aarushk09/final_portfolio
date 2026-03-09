import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    const locations = await request.json()

    if (!Array.isArray(locations)) {
      return NextResponse.json({ error: "Expected an array of locations" }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), "public", "photo-locations.json")
    fs.writeFileSync(filePath, JSON.stringify(locations, null, 2), "utf-8")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to save locations:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
