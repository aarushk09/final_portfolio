import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    const CLIENT_ID = "39645a567ce04ca5b18b9f9fcd401230"
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "4a846d68dae24c4b90d9eff0d992087c" // Your secret
    const REDIRECT_URI = "https://localhost:3000/spotify-setup"

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

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to get refresh token" }, { status: 500 })
  }
}
