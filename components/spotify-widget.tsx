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
  const [localProgress, setLocalProgress] = useState(0)

  const fetchSpotifyData = async () => {
    try {
      const response = await fetch("/api/spotify")
      const data = await response.json()
      setSpotifyData(data)
      if (data.progress) {
        setLocalProgress(data.progress)
      }
    } catch (error) {
      console.error("Error fetching Spotify data:", error)
      setSpotifyData({ isPlaying: false })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpotifyData()

    // Update every 10 seconds for fresh data
    const interval = setInterval(fetchSpotifyData, 10000)

    return () => clearInterval(interval)
  }, [])

  // Live progress bar update every second
  useEffect(() => {
    if (!spotifyData?.isPlaying || !spotifyData.progress) return

    const progressInterval = setInterval(() => {
      setLocalProgress((prev) => {
        if (!spotifyData.duration) return prev
        const newProgress = prev + 1000
        return newProgress >= spotifyData.duration ? spotifyData.duration : newProgress
      })
    }, 1000)

    return () => clearInterval(progressInterval)
  }, [spotifyData?.isPlaying, spotifyData?.progress, spotifyData?.duration])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getProgressPercentage = () => {
    if (!spotifyData?.duration || !localProgress) return 0
    return (localProgress / spotifyData.duration) * 100
  }

  if (loading) {
    return (
      <div
        className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl px-6 py-3 flex items-center gap-3 shadow-lg min-w-[320px]">
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
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl px-6 py-3 flex items-center gap-3 shadow-lg min-w-[320px]">
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
        className="block bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl p-4 shadow-lg hover:bg-zinc-800/80 transition-all duration-300 group min-w-[400px] max-w-[500px]"
      >
        <div className="flex items-center gap-4">
          {/* Album Art */}
          {spotifyData.albumImageUrl && (
            <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
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

            <div className="text-white font-inter font-medium text-base truncate group-hover:text-green-400 transition-colors mb-1">
              {spotifyData.title}
            </div>

            <div className="text-zinc-400 font-crimson-text text-sm truncate mb-3">by {spotifyData.artist}</div>

            {/* Progress Bar */}
            {spotifyData.duration && localProgress && (
              <div>
                <div className="flex justify-between text-xs text-zinc-500 mb-2">
                  <span>{formatTime(localProgress)}</span>
                  <span>{formatTime(spotifyData.duration)}</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300 ease-linear"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Spotify Icon */}
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-green-500 group-hover:text-green-400 transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>
        </div>
      </a>
    </div>
  )
}
