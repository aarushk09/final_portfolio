import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ photos: [] })
    }

    // List files using REST API
    const listUrl = `${supabaseUrl}/storage/v1/object/list/portfolio-photos`

    const response = await fetch(listUrl, {
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

    if (!response.ok) {
      console.error("Failed to list photos:", response.status, response.statusText)
      return NextResponse.json({ photos: [] })
    }

    const files = await response.json()

    // Filter for image files and format for frontend
    const photos = files
      .filter((file: any) => {
        const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        return isImage && file.name !== ".emptyFolderPlaceholder"
      })
      .map((file: any) => ({
        id: `photos/${file.name}`,
        url: `${supabaseUrl}/storage/v1/object/public/portfolio-photos/photos/${file.name}`,
        uploadedAt: file.created_at || new Date().toISOString(),
      }))
      .sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    return NextResponse.json({ photos })
  } catch (error) {
    console.error("Failed to fetch photos:", error)
    return NextResponse.json({ photos: [] })
  }
}
