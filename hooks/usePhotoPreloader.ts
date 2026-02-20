"use client"

import { useState, useCallback, useRef } from "react"

interface Photo {
  id: string
  url: string
  uploadedAt: string
}

interface PreloadState {
  photos: Photo[]
  preloadedUrls: Set<string>
  isPreloading: boolean
}

export function usePhotoPreloader() {
  const [state, setState] = useState<PreloadState>({
    photos: [],
    preloadedUrls: new Set(),
    isPreloading: false,
  })
  
  // Use a ref to track if we've already started preloading to prevent double-firing
  const hasStartedRef = useRef(false)

  const preloadImage = useCallback((url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject()
      img.src = url
    })
  }, [])

  const startPreloading = useCallback(async () => {
    if (state.isPreloading || hasStartedRef.current) return
    
    hasStartedRef.current = true
    setState((prev) => ({ ...prev, isPreloading: true }))

    try {
      // Fetch only first 12 photos for initial load
      const response = await fetch("/api/photos?limit=12&page=1")
      if (!response.ok) return

      const data = await response.json()
      const photos = data.photos || []

      setState((prev) => ({ ...prev, photos }))

      // Preload the images
      const batchSize = 6
      
      for (let i = 0; i < photos.length; i += batchSize) {
        const batch = photos.slice(i, i + batchSize)

        // Preload batch in parallel
        await Promise.allSettled(
          batch.map(async (photo: Photo) => {
            try {
              await preloadImage(photo.url)
              setState(prev => ({
                ...prev,
                preloadedUrls: new Set(prev.preloadedUrls).add(photo.url)
              }))
            } catch (err) {
              console.warn(`Failed to preload image: ${photo.url}`)
            }
          })
        )
      }
    } catch (error) {
      console.error("Failed to preload photos:", error)
    } finally {
      setState((prev) => ({ ...prev, isPreloading: false }))
    }
  }, [state.isPreloading, preloadImage])

  return {
    photos: state.photos,
    preloadedUrls: state.preloadedUrls,
    isPreloading: state.isPreloading,
    startPreloading,
  }
}
