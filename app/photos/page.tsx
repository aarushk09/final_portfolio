"use client"

import { SpotifyWidget } from "@/components/spotify-widget"
import { Navigation } from "@/components/navigation"
import { PhotoGlobe, PhotoPanel } from "@/components/photo-globe"
import type { PhotoLocation } from "@/lib/photo-locations"
import { fetchLocations } from "@/lib/photo-locations"
import { useState, useEffect } from "react"
import Image from "next/image"

/* ── Gallery list view ───────────────────────────────────────────────────── */
function GalleryView({
  locations,
  onOpenLocation,
}: {
  locations: PhotoLocation[]
  onOpenLocation: (loc: PhotoLocation) => void
}) {
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null)

  if (locations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="font-inter text-xs text-zinc-600">No locations yet — add photos via Manage.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pb-10" style={{ scrollbarWidth: "none" }}>
      <div className="space-y-14">
        {locations.map((loc) => (
          <section key={loc.id}>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
              <h2 className="font-inter text-sm font-medium text-white/85 tracking-wide">{loc.name}</h2>
              <span className="font-inter text-[9px] uppercase tracking-[0.2em] text-zinc-600 border border-zinc-800 px-1.5 py-0.5 rounded">
                {loc.type}
              </span>
              <div className="flex-1 h-px bg-zinc-800/60" />
              <span className="font-inter text-[10px] text-zinc-700 flex-shrink-0">
                {loc.photos.length} photo{loc.photos.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loc.photos.length === 0 ? (
              <p className="font-inter text-[11px] text-zinc-700 pl-5">No photos added yet</p>
            ) : (
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}
              >
                {loc.photos.map((photo) => {
                  const isHov = hoveredPhoto === photo.id
                  return (
                    <button
                      key={photo.id}
                      className="group relative overflow-hidden rounded-xl border border-zinc-800 focus:outline-none"
                      style={{ aspectRatio: "1 / 1" }}
                      onMouseEnter={() => setHoveredPhoto(photo.id)}
                      onMouseLeave={() => setHoveredPhoto(null)}
                      onClick={() => onOpenLocation(loc)}
                    >
                      <Image
                        src={photo.url}
                        alt={photo.caption || loc.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="160px"
                      />
                      {/* Subtle permanent vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      {/* Caption slides up on hover */}
                      {photo.caption && (
                        <div
                          className="absolute inset-x-0 bottom-0 px-2 py-2 pointer-events-none transition-all duration-200"
                          style={{
                            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                            opacity: isHov ? 1 : 0,
                            transform: isHov ? "translateY(0)" : "translateY(4px)",
                          }}
                        >
                          <p className="font-inter text-[10px] text-white/90 line-clamp-2 leading-tight">
                            {photo.caption}
                          </p>
                        </div>
                      )}
                      {/* Border highlight on hover */}
                      <div
                        className="absolute inset-0 rounded-xl border transition-colors duration-200 pointer-events-none"
                        style={{ borderColor: isHov ? "rgba(255,255,255,0.15)" : "transparent" }}
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function PhotosPage() {
  const [showSpotify, setShowSpotify] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<PhotoLocation | null>(null)
  const [view, setView] = useState<"globe" | "gallery">("globe")
  const [locations, setLocations] = useState<PhotoLocation[]>([])

  useEffect(() => {
    fetchLocations().then(setLocations)
    const sync = () => fetchLocations().then(setLocations)
    window.addEventListener("photo-locations-changed", sync)
    return () => window.removeEventListener("photo-locations-changed", sync)
  }, [])

  useEffect(() => {
    const handleScroll = () => setShowSpotify(window.scrollY < 100)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isGallery = view === "gallery"

  return (
    <main
      className={`flex flex-col relative ${isGallery ? "min-h-screen" : "h-screen overflow-hidden"}`}
    >
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

      <div className={`flex flex-col px-8 pt-8 pb-4 ${isGallery ? "flex-1" : "flex-1 min-h-0"}`}>
        {/* Header row */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <p className="font-inter text-xs uppercase tracking-[0.35em] text-zinc-600">Photos</p>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 mr-14">
            <button
              onClick={() => setView("globe")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-inter text-[11px] transition-all duration-150 ${
                view === "globe"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {/* Globe icon */}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              Globe
            </button>
            <button
              onClick={() => setView("gallery")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-inter text-[11px] transition-all duration-150 ${
                view === "gallery"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {/* Grid icon */}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
              Gallery
            </button>
          </div>
        </div>

        {/* Main content area */}
        {view === "globe" ? (
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <PhotoGlobe onOpenLocation={setSelectedLocation} panelOpen={!!selectedLocation} />
          </div>
        ) : (
          <GalleryView locations={locations} onOpenLocation={setSelectedLocation} />
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between flex-shrink-0 border-t border-zinc-800/50 pt-3 mt-3">
          <p className="font-inter text-[11px] text-zinc-700">
            {view === "globe"
              ? "Drag to rotate · scroll to zoom · click a marker to view photos"
              : `${locations.length} location${locations.length !== 1 ? "s" : ""} · ${locations.reduce((s, l) => s + l.photos.length, 0)} photos total`}
          </p>
          <div className="flex items-center gap-4">
            <p className="font-inter text-[11px] text-zinc-700">© 2026 Aarush Kute</p>
          </div>
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
