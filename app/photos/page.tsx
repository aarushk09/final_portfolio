"use client"

import { SpotifyWidget } from "@/components/spotify-widget"
import { Navigation } from "@/components/navigation"
import { PhotoGallery } from "@/components/photo-gallery"
import { usePhotoPreloader } from "@/hooks/usePhotoPreloader"
import { useState, useEffect } from "react"

// Uncomment these when you need the admin buttons
// import { PhotoUpload } from "@/components/photo-upload"
// import { DeleteAllPhotos } from "@/components/delete-all-photos"
// import { StorageSetup } from "@/components/storage-setup"

export default function PhotosPage() {
  const [showSpotify, setShowSpotify] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Start preloading photos immediately
  const { photos, preloadedUrls, startPreloading } = usePhotoPreloader()

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setShowSpotify(scrollY < 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Start preloading photos as soon as the page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      startPreloading()
    }, 1000)

    return () => clearTimeout(timer)
  }, [startPreloading])

  return (
    <main className="min-h-screen relative">
      {/* Subtle Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_0%,transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <SpotifyWidget isVisible={showSpotify && !sidebarOpen} />

      <Navigation
        activeTab="photos"
        onTabChange={() => {}}
        onSidebarToggle={setSidebarOpen}
        showSpotifyInSidebar={true}
      />

      {/* Photos Content */}
      <section className="px-8 py-20 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-inter text-sm uppercase tracking-[0.2em] text-zinc-500">Photos</h2>
          <div className="flex items-center gap-4">
            {/* Admin buttons - uncomment when needed for management
            <StorageSetup />
            <PhotoUpload existingPhotos={photos} />
            {photos.length > 0 && <DeleteAllPhotos photoCount={photos.length} />}
            */}
          </div>
        </div>
        <PhotoGallery preloadedPhotos={photos} preloadedUrls={preloadedUrls} />
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 max-w-7xl mx-auto border-t border-zinc-800/50">
        <p className="font-inter text-sm text-zinc-600">© 2024 Aarush. Building cool stuff from Cumming, Georgia.</p>
      </footer>
    </main>
  )
}
