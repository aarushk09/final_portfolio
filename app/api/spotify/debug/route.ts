import { NextResponse } from "next/server"

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
const SPOTIFY_NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing"
const SPOTIFY_USER_URL = "https://api.spotify.com/v1/me"

async function getAccessToken() {
  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN
  const client_id = process.env.SPOTIFY_CLIENT_ID
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET

  if (!refresh_token || !client_id || !client_secret) {
    throw new Error("Missing Spotify environment variables")
  }

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    }),
  })

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`)
  }

  return response.json()
}

export async function GET() {
  try {
    console.log("=== SPOTIFY DEBUG ENDPOINT ===")
    
    // Test environment variables
    const envCheck = {
      SPOTIFY_REFRESH_TOKEN: !!process.env.SPOTIFY_REFRESH_TOKEN,
      SPOTIFY_CLIENT_ID: !!process.env.SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET: !!process.env.SPOTIFY_CLIENT_SECRET,
      refresh_token_preview: process.env.SPOTIFY_REFRESH_TOKEN ? 
        `${process.env.SPOTIFY_REFRESH_TOKEN.substring(0, 10)}...` : 'undefined'
    }
    console.log("Environment check:", envCheck)

    // Test token refresh
    const tokenData = await getAccessToken()
    console.log("Token refresh successful:", {
      has_access_token: !!tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
    })

    // Test user endpoint
    const userResponse = await fetch(SPOTIFY_USER_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const userData = userResponse.ok ? await userResponse.json() : null
    console.log("User endpoint test:", {
      status: userResponse.status,
      user_id: userData?.id,
      display_name: userData?.display_name,
    })

    // Test currently playing endpoint
    const nowPlayingResponse = await fetch(SPOTIFY_NOW_PLAYING_URL, {
      headers: { 
        Authorization: `Bearer ${tokenData.access_token}`,
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store',
    })
    
    let nowPlayingData = null
    if (nowPlayingResponse.status === 200) {
      nowPlayingData = await nowPlayingResponse.json()
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        ...envCheck,
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: !!process.env.VERCEL,
      },
      token_refresh: {
        success: !!tokenData.access_token,
        expires_in: tokenData.expires_in,
        scope: tokenData.scope,
      },
      user_endpoint: {
        status: userResponse.status,
        user_id: userData?.id || 'N/A',
        display_name: userData?.display_name || 'N/A',
        country: userData?.country || 'N/A',
      },
      currently_playing_endpoint: {
        status: nowPlayingResponse.status,
        has_item: !!nowPlayingData?.item,
        is_playing: nowPlayingData?.is_playing,
        song_name: nowPlayingData?.item?.name,
        artist_name: nowPlayingData?.item?.artists?.[0]?.name,
        device_name: nowPlayingData?.device?.name,
        device_active: nowPlayingData?.device?.is_active,
        progress_ms: nowPlayingData?.progress_ms,
        duration_ms: nowPlayingData?.item?.duration_ms,
      },
      rate_limit: {
        remaining: nowPlayingResponse.headers.get('x-ratelimit-remaining'),
        limit: nowPlayingResponse.headers.get('x-ratelimit-limit'),
        retry_after: nowPlayingResponse.headers.get('retry-after'),
      }
    }

    console.log("Debug info compiled:", debugInfo)

    return NextResponse.json(debugInfo, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
      }
    })

  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
