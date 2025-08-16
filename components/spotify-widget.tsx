"use client"

import { useState, useEffect, useRef } from "react"
import { Music, Minimize2 } from "lucide-react"
import Image from "next/image"

interface SpotifyData {
  isPlaying: boolean
  track?: {
    name: string
    artists: { name: string }[]
    album: {
      name: string
      images: { url: string }[]
    }
    external_urls: {
      spotify: string
    }
  }
  progress_ms?: number
  duration_ms?: number
}

interface SpotifyWidgetProps {
  isVisible?: boolean
  inSidebar?: boolean
}

export function SpotifyWidget({ isVisible = true, inSidebar = false }: SpotifyWidgetProps) {
  const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [errorCount, setErrorCount] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchSpotifyData = async () => {
    try {
      const response = await fetch("/api/spotify")

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limited")
        }
        if (response.status === 401) {
          throw new Error("Unauthorized - please reconnect Spotify")
        }
        if (response.status === 403) {
          throw new Error("Forbidden - check Spotify permissions")
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const text = await response.text()
      if (!text.trim()) {
        throw new Error("Empty response")
      }

      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "Response:", text.substring(0, 200))
        throw new Error("Invalid JSON response")
      }

      setSpotifyData(data)
      setError(null)
      setErrorCount(0)
      setImageError(false) // Reset image error when new data arrives
    } catch (err) {
      console.error("Error fetching Spotify data:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(errorMessage)
      setErrorCount((prev) => prev + 1)

      // Set longer intervals after errors
      if (errorMessage.includes("Rate limited")) {
        // For rate limiting, wait longer
        const waitTime = Math.min(10000 + errorCount * 20000, 60000) // 10s, 30s, 50s, max 60s
        console.log(`Rate limited, waiting ${waitTime / 1000}s before retry`)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isVisible) return

    fetchSpotifyData()

    // Update every second for progress bar
    intervalRef.current = setInterval(() => {
      if (spotifyData?.isPlaying && spotifyData.progress_ms !== undefined && spotifyData.duration_ms) {
        setSpotifyData((prev) => {
          if (!prev || !prev.isPlaying) return prev
          const newProgress = (prev.progress_ms || 0) + 1000
          if (newProgress >= (prev.duration_ms || 0)) {
            return prev // Don't exceed duration
          }
          return {
            ...prev,
            progress_ms: newProgress,
          }
        })
      }
    }, 1000)

    // Fetch fresh data every 10 seconds, or longer if there are errors
    const refreshInterval = errorCount > 0 ? Math.min(10000 + errorCount * 20000, 60000) : 10000
    refreshIntervalRef.current = setInterval(fetchSpotifyData, refreshInterval)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current)
    }
  }, [isVisible, errorCount])

  const toggleMinimized = () => {
    if (isAnimating) return

    setIsAnimating(true)
    setIsMinimized(!isMinimized)

    setTimeout(() => {
      setIsAnimating(false)
    }, 600)
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getProgressPercentage = () => {
    if (!spotifyData?.progress_ms || !spotifyData?.duration_ms) return 0
    return (spotifyData.progress_ms / spotifyData.duration_ms) * 100
  }

  if (!isVisible) return null

  const baseClasses = inSidebar ? "w-full" : "fixed top-6 left-1/2 transform -translate-x-1/2 z-50"

  if (loading) {
    return (
      <div className={`${baseClasses} transition-all duration-300 opacity-0 animate-fade-in`}>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-zinc-700 rounded-xl animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-zinc-700 rounded animate-pulse mb-2" />
              <div className="h-3 bg-zinc-700 rounded animate-pulse w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !spotifyData) {
    const isRateLimited = error?.includes("Rate limited")
    const statusColor = isRateLimited ? "yellow" : "green"
    const statusText = isRateLimited ? "rate limited" : "locked in"

    return (
      <div className={`${baseClasses} transition-all duration-300`}>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 w-52">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 bg-${statusColor}-500 rounded-full animate-pulse`} />
            <span className="text-white font-inter text-sm">aarush is {statusText}</span>
          </div>
        </div>
      </div>
    )
  }

  const isPlaying = spotifyData.isPlaying && spotifyData.track
  const track = spotifyData.track

  if (isMinimized) {
    return (
      <div
        className={`${baseClasses} transition-all duration-600 ease-out ${isAnimating ? "animate-expand-from-minimized" : ""}`}
      >
        <button
          onClick={toggleMinimized}
          disabled={isAnimating}
          className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 hover:scale-105 hover:bg-black/50 transition-all duration-300 disabled:pointer-events-none group"
          style={{
            width: isAnimating ? "300px" : "200px",
            transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white font-inter text-sm">aarush is locked in</span>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div
      className={`${baseClasses} transition-all duration-600 ease-out ${isAnimating ? "animate-collapse-to-minimized" : ""}`}
    >
      <div
        className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all duration-600 ease-out"
        style={{
          width: isAnimating ? "300px" : "360px",
          opacity: isAnimating ? 0.8 : 1,
          transform: isAnimating ? "scale(0.95)" : "scale(1)",
          transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-green-500" />
            <span className="text-white font-inter text-sm font-medium">Now Playing</span>
          </div>
          <button
            onClick={toggleMinimized}
            disabled={isAnimating}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-300 disabled:pointer-events-none group"
          >
            <Minimize2 className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div
          className="p-4 transition-all duration-600 ease-out delay-200"
          style={{
            opacity: isAnimating ? 0 : 1,
            transform: isAnimating ? "translateY(10px)" : "translateY(0)",
          }}
        >
          {isPlaying && track ? (
            <div className="space-y-3">
              {/* Track Info */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0">
                  {track.album.images[0]?.url && !imageError ? (
                    <Image
                      src={track.album.images[0].url || "/placeholder.svg"}
                      alt={track.album.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized={false}
                      priority={false}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                      <Music className="w-5 h-5 text-zinc-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="overflow-hidden">
                    <h3
                      className={`text-white font-inter text-sm font-medium leading-tight ${
                        track.name.length > 25 ? "animate-scroll-text" : ""
                      }`}
                      style={{
                        animationDuration: track.name.length > 25 ? "15s" : "none",
                      }}
                    >
                      {track.name}
                    </h3>
                  </div>
                  <p className="text-zinc-400 font-inter text-xs mt-1 truncate">
                    {track.artists.map((artist) => artist.name).join(", ")}
                  </p>
                  <p className="text-zinc-500 font-inter text-xs truncate">{track.album.name}</p>
                </div>
              </div>

              {/* Progress Bar */}
              {spotifyData.duration_ms && (
                <div className="space-y-1">
                  <div className="w-full bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-zinc-500 font-inter text-xs">
                    <span>{formatTime(spotifyData.progress_ms || 0)}</span>
                    <span>{formatTime(spotifyData.duration_ms)}</span>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 font-inter text-xs">aarush is locked in</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-white font-inter text-sm">aarush is locked in</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
