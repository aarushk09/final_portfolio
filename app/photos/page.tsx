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
    <main className="min-h-screen relative">
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

      {/* Globe Section */}
      <section className="px-8 pt-20 pb-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
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

        <div className="flex justify-center">
          <PhotoGlobe onOpenLocation={setSelectedLocation} panelOpen={!!selectedLocation} />
        </div>

        <p className="text-center font-inter text-[11px] text-zinc-700 mt-6">
          Drag to rotate. Click a marker to view photos.
        </p>
      </section>

      {/* Footer */}
      <footer className="px-8 py-10 max-w-7xl mx-auto border-t border-zinc-800/50">
        <p className="font-inter text-xs text-zinc-700 tracking-wide">
          © 2026 Aarush Kute, Cumming, Georgia
        </p>
      </footer>

      {/* Photo Panel (opens when clicking a globe marker) */}
      <PhotoPanel
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />

    </main>
  )
}
