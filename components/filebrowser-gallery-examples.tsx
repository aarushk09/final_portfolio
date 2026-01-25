/**
 * Example: Frontend Component for Photo Gallery with Filebrowser
 * 
 * This shows how to use the Filebrowser API in your React/Next.js components
 */

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Photo {
  id: string
  url: string
  uploadedAt: string
  name: string
  size: number
}

interface PhotoResponse {
  photos: Photo[]
  error?: string
}

export function FilebrowserPhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/photos')
      
      if (!response.ok) {
        throw new Error('Failed to fetch photos')
      }

      const data: PhotoResponse = await response.json()
      
      setPhotos(data.photos)
      
      // Check if we're using fallback images
      if (data.error) {
        setError(data.error)
      }
    } catch (err) {
      console.error('Error fetching photos:', err)
      setError('Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-yellow-600 mb-4">⚠️ {error}</p>
        <button 
          onClick={fetchPhotos}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No photos found. Upload some images to your Filebrowser!
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Portfolio ({photos.length} photos)
        </h2>
        <button 
          onClick={fetchPhotos}
          className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            {/* Image */}
            <div className="aspect-square relative bg-gray-100">
              <img
                src={photo.url}
                alt={photo.name}
                className="object-cover w-full h-full"
                loading="lazy"
              />
            </div>

            {/* Overlay with info */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity flex items-end">
              <div className="p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="font-semibold truncate">{photo.name}</p>
                <p className="text-sm text-gray-300">
                  {new Date(photo.uploadedAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">
                  {(photo.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Example 2: Simple Image Grid (Minimal)
 */
export function SimplePhotoGrid() {
  const [photos, setPhotos] = useState<Photo[]>([])

  useEffect(() => {
    fetch('/api/photos')
      .then(r => r.json())
      .then(data => setPhotos(data.photos))
  }, [])

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {photos.map((photo) => (
        <img
          key={photo.id}
          src={photo.url}
          alt={photo.name}
          className="w-full h-64 object-cover rounded"
        />
      ))}
    </div>
  )
}

/**
 * Example 3: Masonry Layout
 */
export function MasonryPhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])

  useEffect(() => {
    fetch('/api/photos')
      .then(r => r.json())
      .then(data => setPhotos(data.photos))
  }, [])

  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 p-4">
      {photos.map((photo) => (
        <div key={photo.id} className="mb-4 break-inside-avoid">
          <img
            src={photo.url}
            alt={photo.name}
            className="w-full rounded shadow-lg hover:shadow-xl transition-shadow"
          />
        </div>
      ))}
    </div>
  )
}

/**
 * Example 4: With Lightbox (Click to Enlarge)
 */
export function PhotoGalleryWithLightbox() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  useEffect(() => {
    fetch('/api/photos')
      .then(r => r.json())
      .then(data => setPhotos(data.photos))
  }, [])

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-4 gap-2 p-4">
        {photos.map((photo) => (
          <img
            key={photo.id}
            src={photo.url}
            alt={photo.name}
            className="w-full h-48 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
            onClick={() => setSelectedPhoto(photo)}
          />
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button 
              className="absolute -top-10 right-0 text-white text-2xl"
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <p className="text-white text-center mt-4">{selectedPhoto.name}</p>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Example 5: With Infinite Scroll (if you have many photos)
 */
export function InfiniteScrollGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [displayCount, setDisplayCount] = useState(12)

  useEffect(() => {
    fetch('/api/photos')
      .then(r => r.json())
      .then(data => setPhotos(data.photos))
  }, [])

  const loadMore = () => {
    setDisplayCount(prev => prev + 12)
  }

  const displayedPhotos = photos.slice(0, displayCount)

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-3 gap-4">
        {displayedPhotos.map((photo) => (
          <img
            key={photo.id}
            src={photo.url}
            alt={photo.name}
            className="w-full h-64 object-cover rounded"
          />
        ))}
      </div>

      {displayCount < photos.length && (
        <div className="text-center mt-8">
          <button 
            onClick={loadMore}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Load More ({photos.length - displayCount} remaining)
          </button>
        </div>
      )}
    </div>
  )
}

