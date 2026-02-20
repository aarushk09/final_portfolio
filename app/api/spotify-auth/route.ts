import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { code, redirect_uri } = await request.json()

    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID?.trim()
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET?.trim()
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.json({ error: "SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in .env.local" }, { status: 500 })
    }
    const REDIRECT_URI = redirect_uri || "https://final-portfolio-lemon-gamma.vercel.app/spotify-setup"

    console.log("Exchanging code for token...")

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    })

    const data = await response.json()

    if (data.error) {
      console.error("Spotify API Error:", data)
      return NextResponse.json({ error: data.error_description || data.error }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to get refresh token" }, { status: 500 })
  }
}
