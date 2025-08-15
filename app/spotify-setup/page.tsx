"use client"

import { useState } from "react"

export default function SpotifySetup() {
  const [code, setCode] = useState("")
  const [refreshToken, setRefreshToken] = useState("")
  const [loading, setLoading] = useState(false)

  const CLIENT_ID = "39645a567ce04ca5b18b9f9fcd401230"
  const REDIRECT_URI = "https://final-portfolio-lemon-gamma.vercel.app/spotify-setup"

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user-read-currently-playing user-read-playback-state`

  const getRefreshToken = async () => {
    if (!code) return

    setLoading(true)
    try {
      const response = await fetch("/api/spotify-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()
      if (data.refresh_token) {
        setRefreshToken(data.refresh_token)
      }
    } catch (error) {
      console.error("Error:", error)
    }
    setLoading(false)
  }

  // Check if we got a code from the URL
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const codeFromUrl = urlParams.get("code")
    if (codeFromUrl) {
      setCode(codeFromUrl)
    }
  })

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Spotify Setup</h1>

        <div className="space-y-6">
          <div className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Step 1: Authorize Spotify</h2>
            <p className="text-zinc-400 mb-4">Click this button to authorize your Spotify account:</p>
            <a
              href={authUrl}
              className="inline-block bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Authorize Spotify
            </a>
          </div>

          {code && (
            <div className="bg-zinc-900 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Step 2: Get Refresh Token</h2>
              <p className="text-zinc-400 mb-4">Authorization code received! Click to get your refresh token:</p>
              <button
                onClick={getRefreshToken}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? "Getting Token..." : "Get Refresh Token"}
              </button>
            </div>
          )}

          {refreshToken && (
            <div className="bg-green-900/20 border border-green-700 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-green-400">Step 3: Add to Environment</h2>
              <p className="text-zinc-400 mb-4">Add this to your .env.local file:</p>
              <div className="bg-zinc-800 p-4 rounded font-mono text-sm">
                <div>SPOTIFY_CLIENT_ID=39645a567ce04ca5b18b9f9fcd401230</div>
                <div>SPOTIFY_CLIENT_SECRET=your_client_secret_here</div>
                <div>SPOTIFY_REFRESH_TOKEN={refreshToken}</div>
              </div>
              <p className="text-green-400 mt-4 font-semibold">✅ Setup Complete! Your Spotify widget will now work.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
