"use client"

import { useState, useEffect, useRef } from "react"
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
  inSidebar?: boolean
}

export function SpotifyWidget({ isVisible, inSidebar = false }: SpotifyWidgetProps) {
  const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [localProgress, setLocalProgress] = useState(0)
  const [isMinimized, setIsMinimized] = useState(true) // Start minimized by default
  const [shouldScroll, setShouldScroll] = useState(false)
  const titleRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Check if title needs scrolling
  useEffect(() => {
    if (titleRef.current && containerRef.current) {
      const titleWidth = titleRef.current.scrollWidth
      const containerWidth = containerRef.current.clientWidth
      setShouldScroll(titleWidth > containerWidth)
    }
  }, [spotifyData?.title])

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

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized)
  }

  if (loading) {
    return (
      <div
        className={`${
          inSidebar
            ? "w-full"
            : `fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`
        }`}
      >
        <div
          className={`bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-lg ${inSidebar ? "w-full" : "min-w-[280px]"}`}
        >
          <div className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse" />
          <span className="text-zinc-400 font-crimson-text text-sm">Loading music...</span>
        </div>
      </div>
    )
  }

  if (!spotifyData?.isPlaying || !spotifyData.title) {
    return (
      <div
        className={`${
          inSidebar
            ? "w-full"
            : `fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`
        }`}
      >
        <button
          onClick={toggleMinimized}
          className={`bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-lg hover:bg-zinc-800/80 transition-all duration-300 ${inSidebar ? "w-full" : "min-w-[280px]"}`}
        >
          <div className="w-2 h-2 bg-zinc-500 rounded-full" />
          <span className="text-zinc-400 font-crimson-text text-sm">aarush is locked in</span>
        </button>
      </div>
    )
  }

  // Minimized view
  if (isMinimized && !inSidebar) {
    return (
      <div
        className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <button
          onClick={toggleMinimized}
          className="bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-lg hover:bg-zinc-800/80 transition-all duration-300"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 font-inter text-xs uppercase tracking-wide">now playing</span>
        </button>
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        @keyframes carousel-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .carousel-scroll {
          animation: carousel-scroll 15s linear infinite;
          animation-delay: 2s;
        }
        .carousel-container {
          display: flex;
          width: fit-content;
        }
        .carousel-text {
          padding-right: 2rem;
        }
        @keyframes expand-widget {
          from {
            max-height: 40px;
            opacity: 0.8;
          }
          to {
            max-height: 200px;
            opacity: 1;
          }
        }
        @keyframes collapse-widget {
          from {
            max-height: 200px;
            opacity: 1;
          }
          to {
            max-height: 40px;
            opacity: 0.8;
          }
        }
        .widget-expand {
          animation: expand-widget 0.4s ease-out forwards;
        }
        .widget-collapse {
          animation: collapse-widget 0.4s ease-in forwards;
        }
      `}</style>
      <div
        className={`${
          inSidebar
            ? "w-full"
            : `fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`
        }`}
      >
        <div
          className={`bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl shadow-lg hover:bg-zinc-800/80 transition-all duration-300 group relative overflow-hidden ${
            inSidebar ? "w-full" : "min-w-[340px] max-w-[380px]"
          }`}
        >
          <a href={spotifyData.songUrl} target="_blank" rel="noopener noreferrer" className="block p-2.5">
            {/* Hide button - only show when not in sidebar */}
            {!inSidebar && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggleMinimized()
                }}
                className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
              >
                <svg className="w-2.5 h-2.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            )}

            <div className="flex items-center gap-3">
              {/* Album Art */}
              {spotifyData.albumImageUrl && (
                <div
                  className={`relative rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 ${inSidebar ? "w-12 h-12" : "w-12 h-12"}`}
                >
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
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 font-inter text-xs uppercase tracking-wide">now playing</span>
                </div>

                <div
                  ref={containerRef}
                  className={`overflow-hidden mb-0.5 transition-all duration-300 ${inSidebar ? "text-sm" : "text-sm"}`}
                >
                  {shouldScroll ? (
                    <div className="carousel-container carousel-scroll">
                      <div className="carousel-text text-white font-inter font-medium group-hover:text-green-400 transition-colors whitespace-nowrap">
                        {spotifyData.title}
                      </div>
                      <div className="carousel-text text-white font-inter font-medium group-hover:text-green-400 transition-colors whitespace-nowrap">
                        {spotifyData.title}
                      </div>
                    </div>
                  ) : (
                    <div
                      ref={titleRef}
                      className="text-white font-inter font-medium group-hover:text-green-400 transition-colors whitespace-nowrap"
                    >
                      {spotifyData.title}
                    </div>
                  )}
                </div>

                <div
                  className={`text-zinc-400 font-crimson-text truncate mb-1.5 transition-all duration-300 ${inSidebar ? "text-xs" : "text-xs"}`}
                >
                  by {spotifyData.artist}
                </div>

                {/* Progress Bar */}
                {spotifyData.duration && localProgress && (
                  <div className="transition-all duration-300">
                    <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                      <span>{formatTime(localProgress)}</span>
                      <span>{formatTime(spotifyData.duration)}</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-1">
                      <div
                        className="bg-green-500 h-1 rounded-full transition-all duration-300 ease-linear"
                        style={{ width: `${getProgressPercentage()}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Spotify Icon */}
              <div className="flex-shrink-0">
                <svg
                  className={`text-green-500 group-hover:text-green-400 transition-colors ${inSidebar ? "w-5 h-5" : "w-5 h-5"}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </div>
            </div>
          </a>
        </div>
      </div>
    </>
  )
}
