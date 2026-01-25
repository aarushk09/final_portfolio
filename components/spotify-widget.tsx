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
  timestamp?: number
  error?: string
  deviceName?: string
  deviceActive?: boolean
  songId?: string
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
  const [isAnimating, setIsAnimating] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [pollingInterval, setPollingInterval] = useState(5000) // Start with 5 seconds
  const titleRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSongIdRef = useRef<string | null>(null)
  const sameDataCountRef = useRef<number>(0)

  const fetchSpotifyData = async () => {
    try {
      console.log(`Fetching Spotify data (attempt ${retryCount + 1})...`)
      
      // Add cache-busting timestamp to prevent client-side caching
      const response = await fetch(`/api/spotify?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Log the response for debugging
      console.log("Spotify API response:", {
        isPlaying: data.isPlaying,
        title: data.title,
        artist: data.artist,
        timestamp: data.timestamp,
        error: data.error,
        songId: data.songId,
        deviceName: data.deviceName,
        deviceActive: data.deviceActive
      })
      
      // Check if we're getting the same song repeatedly (potential stale data)
      if (data.songId && lastSongIdRef.current === data.songId) {
        sameDataCountRef.current++
        if (sameDataCountRef.current >= 3) {
          console.warn(`⚠️ POTENTIAL STALE DATA: Same song ID "${data.songId}" returned ${sameDataCountRef.current} times in a row`)
          console.warn("This might indicate cached responses or token issues in production")
        }
      } else {
        sameDataCountRef.current = 0
        lastSongIdRef.current = data.songId || null
        if (data.songId) {
          console.log(`✅ Song changed to: ${data.title} (ID: ${data.songId})`)
        }
      }
      
      // Reset retry count on successful fetch
      setRetryCount(0)
      setPollingInterval(5000) // Reset to normal polling frequency
      
      setSpotifyData(data)
      setImageError(false) // Reset image error on new data
      
      if (data.progress) {
        setLocalProgress(data.progress)
      }
    } catch (error) {
      console.error("Error fetching Spotify data:", error)
      
      // Increment retry count and implement exponential backoff
      const newRetryCount = retryCount + 1
      setRetryCount(newRetryCount)
      
      // Exponential backoff: 5s, 10s, 20s, 30s max
      const backoffDelay = Math.min(5000 * Math.pow(2, newRetryCount - 1), 30000)
      setPollingInterval(backoffDelay)
      
      console.log(`Will retry in ${backoffDelay / 1000} seconds (attempt ${newRetryCount})`)
      
      // Only set error state if we've failed multiple times
      if (newRetryCount >= 3) {
        setSpotifyData({ isPlaying: false, error: `Failed to fetch data (${newRetryCount} attempts)` })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpotifyData()
  }, []) // Initial fetch

  // Dynamic polling interval based on success/failure
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    intervalRef.current = setInterval(fetchSpotifyData, pollingInterval)
    
    console.log(`Polling interval set to ${pollingInterval / 1000} seconds`)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [pollingInterval])

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
    if (isAnimating) return // Prevent multiple clicks during animation

    setIsAnimating(true)
    setIsMinimized(!isMinimized)

    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false)
    }, 600) // Match the animation duration
  }

  const handleImageError = () => {
    setImageError(true)
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
      <>
        <style>{`
          @keyframes expand-from-minimized {
            0% {
              width: 200px;
              height: 40px;
              opacity: 1;
            }
            50% {
              width: 300px;
              height: 60px;
              opacity: 0.8;
            }
            100% {
              width: 360px;
              height: 120px;
              opacity: 1;
            }
          }
          
          @keyframes collapse-to-minimized {
            0% {
              width: 360px;
              height: 120px;
              opacity: 1;
            }
            50% {
              width: 300px;
              height: 60px;
              opacity: 0.8;
            }
            100% {
              width: 200px;
              height: 40px;
              opacity: 1;
            }
          }
          
          .widget-expanding {
            animation: expand-from-minimized 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          
          .widget-collapsing {
            animation: collapse-to-minimized 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
        `}</style>
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <button
            onClick={toggleMinimized}
            disabled={isAnimating}
            className="bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-lg hover:bg-zinc-800/80 transition-all duration-300 hover:scale-105"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 font-inter text-xs uppercase tracking-wide">aarush is locked in</span>
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
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
          0% {
            width: 200px;
            height: 40px;
            transform: scale(0.95);
            opacity: 0.8;
          }
          50% {
            width: 300px;
            height: 80px;
            transform: scale(1.02);
            opacity: 0.9;
          }
          100% {
            width: 360px;
            height: auto;
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes collapse-widget {
          0% {
            width: 360px;
            height: auto;
            transform: scale(1);
            opacity: 1;
          }
          50% {
            width: 300px;
            height: 80px;
            transform: scale(0.98);
            opacity: 0.9;
          }
          100% {
            width: 200px;
            height: 40px;
            transform: scale(0.95);
            opacity: 0.8;
          }
        }
        
        @keyframes fade-in-content {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-out-content {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
        
        .widget-expand {
          animation: expand-widget 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .widget-collapse {
          animation: collapse-widget 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .content-fade-in {
          animation: fade-in-content 0.4s ease-out 0.2s both;
        }
        
        .content-fade-out {
          animation: fade-out-content 0.3s ease-in both;
        }
        
        .album-art-animate {
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .progress-bar-animate {
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
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
          } ${isAnimating && !isMinimized ? "widget-expand" : ""} ${
            isAnimating && isMinimized ? "widget-collapse" : ""
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
                disabled={isAnimating}
                className={`absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-all duration-300 z-10 ${
                  isAnimating ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <svg className="w-2.5 h-2.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            )}

            <div className={`flex items-center gap-3 ${isAnimating ? "content-fade-in" : ""}`}>
              {/* Album Art */}
              {spotifyData.albumImageUrl && !imageError && (
                <div
                  className={`relative rounded-lg overflow-hidden flex-shrink-0 album-art-animate ${
                    inSidebar ? "w-12 h-12" : "w-12 h-12"
                  }`}
                >
                  <Image
                    src={spotifyData.albumImageUrl || "/placeholder.svg"}
                    alt={`${spotifyData.album} cover`}
                    fill
                    className="object-cover"
                    onError={handleImageError}
                    unoptimized={false}
                    priority={false}
                  />
                </div>
              )}

              {/* Fallback Album Art */}
              {(!spotifyData.albumImageUrl || imageError) && (
                <div
                  className={`relative rounded-lg overflow-hidden flex-shrink-0 album-art-animate bg-zinc-700 flex items-center justify-center ${
                    inSidebar ? "w-12 h-12" : "w-12 h-12"
                  }`}
                >
                  <svg className="w-6 h-6 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}

              {/* Song Info */}
              <div className="flex-1 min-w-0">
                <div className={`flex items-center gap-2 mb-0.5 ${isAnimating ? "content-fade-in" : ""}`}>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 font-inter text-xs uppercase tracking-wide">aarush is locked in</span>
                </div>

                <div
                  ref={containerRef}
                  className={`overflow-hidden mb-0.5 transition-all duration-300 ${
                    inSidebar ? "text-sm" : "text-sm"
                  } ${isAnimating ? "content-fade-in" : ""}`}
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
                  className={`text-zinc-400 font-crimson-text truncate mb-1.5 transition-all duration-300 ${
                    inSidebar ? "text-xs" : "text-xs"
                  } ${isAnimating ? "content-fade-in" : ""}`}
                >
                  by {spotifyData.artist}
                </div>

                {/* Progress Bar */}
                {spotifyData.duration && localProgress && (
                  <div
                    className={`transition-all duration-300 progress-bar-animate ${isAnimating ? "content-fade-in" : ""}`}
                  >
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
              <div className={`flex-shrink-0 ${isAnimating ? "content-fade-in" : ""}`}>
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
