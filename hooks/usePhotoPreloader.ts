"use client"

import { useState, useCallback } from "react"

interface Photo {
  id: string
  url: string
  uploadedAt: string
}

interface PreloadState {
  photos: Photo[]
  preloadedUrls: Set<string>
  isPreloading: boolean
  preloadProgress: number
}

export function usePhotoPreloader() {
  const [state, setState] = useState<PreloadState>({
    photos: [],
    preloadedUrls: new Set(),
    isPreloading: false,
    preloadProgress: 0,
  })

  const preloadImage = useCallback((url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject()
      img.src = url
    })
  }, [])

  const startPreloading = useCallback(async () => {
    if (state.isPreloading) return

    setState((prev) => ({ ...prev, isPreloading: true, preloadProgress: 0 }))

    try {
      // Fetch photo list
      const response = await fetch("/api/photos")
      if (!response.ok) return

      const data = await response.json()
      const photos = data.photos || []

      setState((prev) => ({ ...prev, photos }))

      // Preload first 12 images in batches of 3 for better performance
      const imagesToPreload = photos.slice(0, 12)
      const batchSize = 3
      const preloadedUrls = new Set<string>()

      for (let i = 0; i < imagesToPreload.length; i += batchSize) {
        const batch = imagesToPreload.slice(i, i + batchSize)

        // Preload batch in parallel
        const batchPromises = batch.map(async (photo: Photo) => {
          try {
            await preloadImage(photo.url)
            preloadedUrls.add(photo.url)
            return photo.url
          } catch (error) {
            console.warn(`Failed to preload image: ${photo.url}`)
            return null
          }
        })

        await Promise.allSettled(batchPromises)

        // Update progress
        const progress = Math.min(((i + batchSize) / imagesToPreload.length) * 100, 100)
        setState((prev) => ({
          ...prev,
          preloadedUrls: new Set([...prev.preloadedUrls, ...preloadedUrls]),
          preloadProgress: progress,
        }))

        // Small delay between batches to prevent overwhelming the browser
        if (i + batchSize < imagesToPreload.length) {
          await new Promise((resolve) => setTimeout(resolve, 200))
        }
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
    preloadProgress: state.preloadProgress,
    startPreloading,
  }
}
