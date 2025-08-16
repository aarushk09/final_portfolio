"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Loader2, X, ChevronLeft, ChevronRight } from "lucide-react"

interface Photo {
  id: string
  url: string
  uploadedAt: string
}

interface PhotoGalleryProps {
  preloadedPhotos?: Photo[]
  preloadedUrls?: Set<string>
}

interface PhotoItemProps {
  photo: Photo
  index: number
  onOpenLightbox: (index: number) => void
  onDelete: (photoId: string) => void
  deleting: string | null
  isPreloaded: boolean
}

function PhotoItem({ photo, index, onOpenLightbox, onDelete, deleting, isPreloaded }: PhotoItemProps) {
  const [isLoaded, setIsLoaded] = useState(isPreloaded)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading (only if not preloaded)
  useEffect(() => {
    if (isPreloaded) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      },
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [isPreloaded])

  return (
    <div
      ref={imgRef}
      className="aspect-square bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer group relative"
    >
      {/* Loading skeleton - only show if not preloaded */}
      {!isLoaded && isInView && !isPreloaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 animate-pulse flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
          <span className="text-zinc-500 font-inter text-sm">Failed to load</span>
        </div>
      )}

      {/* Image */}
      {(isInView || isPreloaded) && (
        <div className="relative w-full h-full" onClick={() => onOpenLightbox(index)}>
          <Image
            src={photo.url || "/placeholder.svg"}
            alt="Uploaded photo"
            fill
            className={`object-cover group-hover:scale-110 transition-all duration-500 ${
              isPreloaded ? "opacity-100" : isLoaded ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            quality={60}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            priority={isPreloaded || index < 8}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        </div>
      )}

      {/* Delete button - commented out for public view */}
      {/*
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(photo.id)
        }}
        disabled={deleting === photo.id}
        className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50"
      >
        {deleting === photo.id ? (
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4 text-white" />
        )}
      </button>
      */}
    </div>
  )
}

export function PhotoGallery({ preloadedPhotos = [], preloadedUrls = new Set() }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>(preloadedPhotos)
  const [loading, setLoading] = useState(preloadedPhotos.length === 0)
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [displayCount, setDisplayCount] = useState(12)

  const fetchPhotos = async () => {
    // If we already have preloaded photos, use them
    if (preloadedPhotos.length > 0) {
      setPhotos(preloadedPhotos)
      setLoading(false)
      return
    }

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

  const deletePhoto = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return

    setDeleting(photoId)
    try {
      const response = await fetch("/api/delete-photo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      })

      if (response.ok) {
        setPhotos((prev) => prev.filter((photo) => photo.id !== photoId))
        if (selectedPhoto !== null && photos[selectedPhoto]?.id === photoId) {
          setSelectedPhoto(null)
        }
      } else {
        alert("Failed to delete photo")
      }
    } catch (error) {
      console.error("Failed to delete photo:", error)
      alert("Failed to delete photo")
    } finally {
      setDeleting(null)
    }
  }

  const openLightbox = useCallback((index: number) => {
    setSelectedPhoto(index)
  }, [])

  const closeLightbox = () => {
    setSelectedPhoto(null)
  }

  const navigateLightbox = (direction: "prev" | "next") => {
    if (selectedPhoto === null) return

    if (direction === "prev") {
      setSelectedPhoto(selectedPhoto > 0 ? selectedPhoto - 1 : photos.length - 1)
    } else {
      setSelectedPhoto(selectedPhoto < photos.length - 1 ? selectedPhoto + 1 : 0)
    }
  }

  const loadMorePhotos = () => {
    setDisplayCount((prev) => prev + 12)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhoto === null) return

      switch (e.key) {
        case "Escape":
          closeLightbox()
          break
        case "ArrowLeft":
          navigateLightbox("prev")
          break
        case "ArrowRight":
          navigateLightbox("next")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedPhoto])

  // Update photos when preloaded photos change
  useEffect(() => {
    if (preloadedPhotos.length > 0) {
      setPhotos(preloadedPhotos)
      setLoading(false)
    }
  }, [preloadedPhotos])

  useEffect(() => {
    fetchPhotos()
  }, [])

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 animate-pulse" />
          </div>
        ))}
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

  const displayedPhotos = photos.slice(0, displayCount)
  const hasMorePhotos = photos.length > displayCount

  return (
    <>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedPhotos.map((photo, index) => (
          <PhotoItem
            key={photo.id}
            photo={photo}
            index={index}
            onOpenLightbox={openLightbox}
            onDelete={deletePhoto}
            deleting={deleting}
            isPreloaded={preloadedUrls.has(photo.url)}
          />
        ))}
      </div>

      {hasMorePhotos && (
        <div className="text-center mt-12">
          <button
            onClick={loadMorePhotos}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-inter text-sm transition-all duration-300"
          >
            Load More Photos ({photos.length - displayCount} remaining)
          </button>
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto !== null && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-3 bg-zinc-900/80 hover:bg-zinc-800 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={() => navigateLightbox("prev")}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-zinc-900/80 hover:bg-zinc-800 rounded-full transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => navigateLightbox("next")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-zinc-900/80 hover:bg-zinc-800 rounded-full transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          <div className="relative max-w-full max-h-full">
            <Image
              src={photos[selectedPhoto].url || "/placeholder.svg"}
              alt="Full size photo"
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              quality={85}
              priority
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-900/80 rounded-full">
            <span className="text-white font-inter text-sm">
              {selectedPhoto + 1} of {photos.length}
            </span>
          </div>

          {/* Delete button in lightbox - commented out for public view */}
          {/*
          <button
            onClick={() => deletePhoto(photos[selectedPhoto].id)}
            disabled={deleting === photos[selectedPhoto].id}
            className="absolute bottom-4 right-4 p-3 bg-red-600/80 hover:bg-red-600 rounded-full transition-colors disabled:opacity-50"
          >
            {deleting === photos[selectedPhoto].id ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5 text-white" />
            )}
          </button>
          */}
        </div>
      )}
    </>
  )
}
