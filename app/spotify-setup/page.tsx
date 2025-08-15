"use client"

import { useState, useEffect } from "react"

export default function SpotifySetup() {
  const [code, setCode] = useState("")
  const [refreshToken, setRefreshToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const CLIENT_ID = "39645a567ce04ca5b18b9f9fcd401230"
  const REDIRECT_URI = "https://final-portfolio-lemon-gamma.vercel.app/spotify-setup"

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user-read-currently-playing user-read-playback-state`

  // Handle mounting and URL parsing
  useEffect(() => {
    setMounted(true)
    const urlParams = new URLSearchParams(window.location.search)
    const codeFromUrl = urlParams.get("code")
    if (codeFromUrl) {
      setCode(codeFromUrl)
    }
  }, [])

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
      } else {
        console.error("Error getting refresh token:", data)
      }
    } catch (error) {
      console.error("Error:", error)
    }
    setLoading(false)
  }

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Spotify Setup</h1>

        <div className="space-y-6">
          <div className="bg-red-900/20 border border-red-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-red-400">⚠️ IMPORTANT: Update Spotify Settings First</h2>
            <p className="text-zinc-400 mb-4">
              Before clicking authorize, make sure your Spotify app has this redirect URI:
            </p>
            <div className="bg-zinc-800 p-3 rounded font-mono text-sm text-green-400">
              https://final-portfolio-lemon-gamma.vercel.app/spotify-setup
            </div>
            <div className="mt-4 text-sm text-zinc-400">
              <p>
                1. Go to{" "}
                <a
                  href="https://developer.spotify.com/dashboard"
                  className="text-blue-400 underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Spotify Developer Dashboard
                </a>
              </p>
              <p>2. Click your app → Settings</p>
              <p>3. Add the URL above to "Redirect URIs"</p>
              <p>4. Click Save</p>
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Step 1: Authorize Spotify</h2>
            <p className="text-zinc-400 mb-4">After updating your redirect URI, click this button:</p>
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
              <p className="text-zinc-400 mb-4">✅ Authorization code received! Click to get your refresh token:</p>
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
              <h2 className="text-xl font-semibold mb-4 text-green-400">🎉 Success! Add to Vercel</h2>
              <p className="text-zinc-400 mb-4">
                Go to your Vercel project settings and add these environment variables:
              </p>
              <div className="bg-zinc-800 p-4 rounded font-mono text-sm space-y-1">
                <div>
                  <span className="text-blue-400">SPOTIFY_CLIENT_ID</span>=39645a567ce04ca5b18b9f9fcd401230
                </div>
                <div>
                  <span className="text-blue-400">SPOTIFY_CLIENT_SECRET</span>=4a846d68dae24c4b90d9eff0d992087c
                </div>
                <div>
                  <span className="text-blue-400">SPOTIFY_REFRESH_TOKEN</span>={refreshToken}
                </div>
              </div>
              <p className="text-green-400 mt-4 font-semibold">
                ✅ After adding these to Vercel and redeploying, your Spotify widget will work!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
