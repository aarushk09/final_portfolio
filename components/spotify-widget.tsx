"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface SpotifyData {
  isPlaying: boolean
  title?: string
  artist?: string
  album?: string
  albumImageUrl?: string
  songUrl?: string
  duration?: number
  progress?: number
}

interface SpotifyWidgetProps {
  isVisible: boolean
}

export function SpotifyWidget({ isVisible }: SpotifyWidgetProps) {
  const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSpotifyData = async () => {
    try {
      const response = await fetch("/api/spotify")
      const data = await response.json()
      setSpotifyData(data)
    } catch (error) {
      console.error("Error fetching Spotify data:", error)
      setSpotifyData({ isPlaying: false })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpotifyData()

    // Update every 30 seconds
    const interval = setInterval(fetchSpotifyData, 30000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getProgressPercentage = () => {
    if (!spotifyData?.duration || !spotifyData?.progress) return 0
    return (spotifyData.progress / spotifyData.duration) * 100
  }

  if (loading) {
    return (
      <div
        className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl px-6 py-3 flex items-center gap-3 shadow-lg">
          <div className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse" />
          <span className="text-zinc-400 font-crimson-text text-sm">Loading music...</span>
        </div>
      </div>
    )
  }

  if (!spotifyData?.isPlaying || !spotifyData.title) {
    return (
      <div
        className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl px-6 py-3 flex items-center gap-3 shadow-lg">
          <div className="w-2 h-2 bg-zinc-500 rounded-full" />
          <span className="text-zinc-400 font-crimson-text text-sm">Not listening to anything</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <a
        href={spotifyData.songUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl p-4 shadow-lg hover:bg-zinc-800/80 transition-all duration-300 group"
      >
        <div className="flex items-center gap-4">
          {/* Album Art */}
          {spotifyData.albumImageUrl && (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={spotifyData.albumImageUrl || "/placeholder.svg"}
                alt={`${spotifyData.album} cover`}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 font-inter text-xs uppercase tracking-wide">Now Playing</span>
            </div>

            <div className="text-white font-inter font-medium text-sm truncate group-hover:text-green-400 transition-colors">
              {spotifyData.title}
            </div>

            <div className="text-zinc-400 font-crimson-text text-xs truncate">by {spotifyData.artist}</div>

            {/* Progress Bar */}
            {spotifyData.duration && spotifyData.progress && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>{formatTime(spotifyData.progress)}</span>
                  <span>{formatTime(spotifyData.duration)}</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-1">
                  <div
                    className="bg-green-500 h-1 rounded-full transition-all duration-1000"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </a>
    </div>
  )
}
