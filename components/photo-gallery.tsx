"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"

interface Photo {
  id: string
  url: string
  uploadedAt: string
}

export function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPhotos = async () => {
    try {
      const response = await fetch("/api/photos")
      if (response.ok) {
        const data = await response.json()
        setPhotos(data.photos || [])
      }
    } catch (error) {
      console.error("Failed to fetch photos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos()

    // Refresh photos every 30 seconds to show new uploads
    const interval = setInterval(fetchPhotos, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
          <p className="text-zinc-400 font-inter">Loading photos...</p>
        </div>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-400 font-crimson-text text-lg mb-4">No photos uploaded yet</p>
        <p className="text-zinc-500 font-inter text-sm">Upload some photos to get started!</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="aspect-square bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer group"
        >
          <div className="relative w-full h-full">
            <Image
              src={photo.url || "/placeholder.svg"}
              alt="Uploaded photo"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </div>
        </div>
      ))}
    </div>
  )
}
