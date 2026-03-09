"use client"

import { SpotifyWidget } from "@/components/spotify-widget"
import { Navigation } from "@/components/navigation"
import { PhotoGlobe, PhotoPanel } from "@/components/photo-globe"
import type { PhotoLocation } from "@/lib/photo-locations"
import { useState, useEffect } from "react"

export default function PhotosPage() {
  const [showSpotify, setShowSpotify] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<PhotoLocation | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setShowSpotify(window.scrollY < 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <main className="h-screen overflow-hidden flex flex-col relative">
      {/* Background */}
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

      {/* Main content — fills viewport, no scroll */}
      <div className="flex flex-col flex-1 min-h-0 px-8 pt-8 pb-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <p className="font-inter text-xs uppercase tracking-[0.35em] text-zinc-600">
            Photos
          </p>
          <a
            href="/upload-photos"
            className="font-inter text-xs text-zinc-600 border border-zinc-800 px-4 py-2 rounded-lg hover:border-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Manage
          </a>
        </div>

        {/* Globe — takes all remaining vertical space */}
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <PhotoGlobe onOpenLocation={setSelectedLocation} panelOpen={!!selectedLocation} />
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between flex-shrink-0 border-t border-zinc-800/50 pt-3 mt-3">
          <p className="font-inter text-[11px] text-zinc-700">
            Drag to rotate · scroll to zoom · click a marker to view photos
          </p>
          <p className="font-inter text-[11px] text-zinc-700">
            © 2026 Aarush Kute
          </p>
        </div>
      </div>

      {/* Photo Panel */}
      <PhotoPanel
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />
    </main>
  )
}
