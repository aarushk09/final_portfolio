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
}

export function usePhotoPreloader() {
  const [state, setState] = useState<PreloadState>({
    photos: [],
    preloadedUrls: new Set(),
    isPreloading: false,
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

    setState((prev) => ({ ...prev, isPreloading: true }))

    try {
      // Fetch photo list
      const response = await fetch("/api/photos")
      if (!response.ok) return

      const data = await response.json()
      const photos = data.photos || []

      setState((prev) => ({ ...prev, photos }))

      // Preload first 12 images in batches of 4 for better performance
      const imagesToPreload = photos.slice(0, 12)
      const batchSize = 4
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

        setState((prev) => ({
          ...prev,
          preloadedUrls: new Set([...prev.preloadedUrls, ...preloadedUrls]),
        }))

        // Small delay between batches
        if (i + batchSize < imagesToPreload.length) {
          await new Promise((resolve) => setTimeout(resolve, 100))
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
    startPreloading,
  }
}
