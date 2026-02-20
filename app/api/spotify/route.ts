import { NextResponse } from "next/server"

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
const SPOTIFY_NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing"

async function getAccessToken() {
  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN?.trim()
  const client_id = process.env.SPOTIFY_CLIENT_ID?.trim()
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET?.trim()

  console.log("Environment variables check:", {
    refresh_token_exists: !!refresh_token,
    client_id_exists: !!client_id,
    client_secret_exists: !!client_secret,
    refresh_token_preview: refresh_token ? `${refresh_token.substring(0, 10)}...` : 'undefined'
  })

  if (!refresh_token) {
    throw new Error("SPOTIFY_REFRESH_TOKEN is not set")
  }
  if (!client_id) {
    throw new Error("SPOTIFY_CLIENT_ID is not set") 
  }
  if (!client_secret) {
    throw new Error("SPOTIFY_CLIENT_SECRET is not set")
  }

  console.log("Requesting fresh Spotify access token...")

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

  console.log(`Token refresh response status: ${response.status}`)

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Failed to refresh Spotify token:", response.status, errorText)
    throw new Error(`Failed to refresh Spotify token: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  console.log("Token refresh response:", {
    has_access_token: !!data.access_token,
    token_type: data.token_type,
    expires_in: data.expires_in,
    scope: data.scope,
    access_token_preview: data.access_token ? `${data.access_token.substring(0, 20)}...` : 'undefined'
  })

  if (!data.access_token) {
    console.error("No access token in response:", data)
    throw new Error("No access token received from Spotify")
  }

  return data
}

async function getNowPlaying() {
  const { access_token } = await getAccessToken()

  console.log("Making request to Spotify API with fresh token...")

  const response = await fetch(SPOTIFY_NOW_PLAYING_URL, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Cache-Control': 'no-cache',
    },
    // Force no caching
    cache: 'no-store',
  })

  console.log(`Spotify currently-playing API response status: ${response.status}`)
  console.log(`Response headers:`, {
    'content-type': response.headers.get('content-type'),
    'cache-control': response.headers.get('cache-control'),
    'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
  })
  
  return response
}

export async function GET() {
  try {
    const response = await getNowPlaying()

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after')
      console.warn(`Spotify API rate limited. Retry after: ${retryAfter} seconds`)
      return NextResponse.json({ isPlaying: false, error: 'Rate limited' }, { status: 429 })
    }

    // Handle unauthorized access (token expired)
    if (response.status === 401) {
      console.error("Spotify API unauthorized - token may be invalid")
      return NextResponse.json({ isPlaying: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Handle no content (nothing playing)
    if (response.status === 204) {
      console.log("Spotify API: No content - nothing currently playing")
      return NextResponse.json({ isPlaying: false }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
        }
      })
    }

    // Handle other errors
    if (response.status > 400) {
      console.error(`Spotify API error: ${response.status}`)
      const errorText = await response.text()
      console.error("Error details:", errorText)
      return NextResponse.json({ isPlaying: false, error: `API error: ${response.status}` })
    }

    const song = await response.json()

    // Log the raw response for debugging
    console.log("Raw Spotify API response:", {
      is_playing: song.is_playing,
      item_exists: !!song.item,
      item_name: song.item?.name,
      item_id: song.item?.id,
      progress_ms: song.progress_ms,
      timestamp: song.timestamp,
      device: song.device ? {
        id: song.device.id,
        is_active: song.device.is_active,
        name: song.device.name,
      } : null,
      currently_playing_type: song.currently_playing_type,
      actions: song.actions,
    })

    if (!song.item) {
      console.log("Spotify API: No item in response - nothing currently playing")
      return NextResponse.json({ isPlaying: false }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
        }
      })
    }

    const isPlaying = song.is_playing
    const title = song.item.name
    const artist = song.item.artists.map((artist: any) => artist.name).join(", ")
    const album = song.item.album.name
    const albumImageUrl = song.item.album.images[0]?.url
    const songUrl = song.item.external_urls.spotify
    const duration = song.item.duration_ms
    const progress = song.progress_ms

    console.log(`Processed song data:`, {
      isPlaying,
      title,
      artist,
      album,
      duration,
      progress,
      songId: song.item.id,
      device_active: song.device?.is_active,
      device_name: song.device?.name,
    })

    console.log(`Currently playing: ${title} by ${artist} (${isPlaying ? 'playing' : 'paused'}) - Device: ${song.device?.name || 'Unknown'}`)

    return NextResponse.json({
      isPlaying,
      title,
      artist,
      album,
      albumImageUrl,
      songUrl,
      duration,
      progress,
      timestamp: Date.now(), // Add timestamp to prevent caching
      deviceName: song.device?.name,
      deviceActive: song.device?.is_active,
      songId: song.item.id, // Add song ID for debugging
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
      }
    })
  } catch (error) {
    console.error("Error fetching Spotify data:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      isPlaying: false, 
      error: errorMessage,
      timestamp: Date.now()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
      }
    })
  }
}
