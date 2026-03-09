"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import Image from "next/image"
import type { PhotoLocation } from "@/lib/photo-locations"
import { fetchLocations, getLocations } from "@/lib/photo-locations"

/* ─────────────────────────────────────────────────────────────────────────────
 * projectToScreen  –  lat/lng → CSS pixel on the cobe canvas
 *
 * Derived directly from cobe v0.6's GLSL:
 *
 *   mat3 J(theta, phi) {
 *     c=cos(theta), d=cos(phi), e=sin(theta), f=sin(phi)
 *     return mat3(d, f*e, -f*c,   0, c, e,   f, -d*e, d*c)   // col-major
 *   }
 *
 *   Marker world pos  P = (-cos(lat)*cos(lngR), sin(lat), cos(lat)*sin(lngR))
 *                     where lngR = lng·π/180 − π
 *
 *   View-space l = L·P  (L = J^T applied as standard matrix multiply)
 *   Screen NDC  a = 0.8·(lx, ly)  →  CSS = size/2 ± lx·R, R = 0.4·size
 *   Visible when lz > 0  (front hemisphere)
 * ───────────────────────────────────────────────────────────────────────── */
function projectToScreen(
  lat: number,
  lng: number,
  phi: number,
  theta: number,
  size: number,
): { x: number; y: number; visible: boolean; depth: number } {
  const latR = (lat * Math.PI) / 180
  const lngR = (lng * Math.PI) / 180 - Math.PI // cobe subtracts π

  const cosLat = Math.cos(latR)
  const Px = -cosLat * Math.cos(lngR)
  const Py = Math.sin(latR)
  const Pz = cosLat * Math.sin(lngR)

  const cp = Math.cos(phi),   sp = Math.sin(phi)
  const ct = Math.cos(theta), st = Math.sin(theta)

  // l = L · P  where L columns are cobe's J columns
  const lx =  cp * Px              + sp * Pz
  const ly =  sp * st * Px + ct * Py - cp * st * Pz
  const lz = -sp * ct * Px + st * Py + cp * ct * Pz

  const R = size * 0.4 // cobe sphere NDC radius = 0.8 → 0.4·cssSize
  return {
    x: size / 2 + lx * R,
    y: size / 2 - ly * R,
    visible: lz > 0.05,
    depth: lz,
  }
}

/* ─── Card Fan ─────────────────────────────────────────────────────────────
 * When a location faces the viewer (depth > threshold) AND has photos,
 * 4 cards arc above the pin like a hand of playing cards.                  */

const FAN_THRESHOLD = 0.55
const FAN_ANGLES = [-22, -8, 8, 22]        // degrees
const FAN_OFFSETS = [-30, -10, 10, 30]      // px horizontal spread
const FAN_LIFTS  = [6, 0, 0, 6]            // px extra vertical lift at edges
const CARD_W = 46
const CARD_H = 60

interface CardFanProps {
  photos: { id: string; url: string; caption?: string }[]
  depth: number
  name: string
  onClick: () => void
}

function CardFan({ photos, depth, name, onClick }: CardFanProps) {
  const t = Math.min(1, (depth - FAN_THRESHOLD) / (1 - FAN_THRESHOLD))
  const cards = photos.slice(0, 4)

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        bottom: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        marginBottom: 8,
        opacity: t,
        transition: "opacity 0.25s ease-out",
      }}
    >
      {/* Card stack */}
      <button
        onClick={onClick}
        className="relative focus:outline-none"
        style={{ width: 96, height: CARD_H + 24, cursor: "pointer" }}
      >
        {cards.map((photo, i) => {
          const angle = FAN_ANGLES[i] ?? 0
          const offsetX = FAN_OFFSETS[i] ?? 0
          const lift = FAN_LIFTS[i] ?? 0
          const scale = 0.88 + t * 0.12
          return (
            <div
              key={photo.id}
              className="absolute rounded-lg overflow-hidden shadow-xl border border-white/10"
              style={{
                width: CARD_W,
                height: CARD_H,
                left: "50%",
                bottom: 0,
                marginLeft: -CARD_W / 2,
                transform: `translateX(${offsetX * t}px) translateY(${-lift * t}px) rotate(${angle * t}deg) scale(${scale})`,
                transformOrigin: "bottom center",
                zIndex: 10 + i,
                transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.25s",
                opacity: Math.min(1, t * 1.5),
              }}
            >
              <Image
                src={photo.url}
                alt={photo.caption || ""}
                fill
                className="object-cover"
                sizes={`${CARD_W}px`}
              />
              {/* subtle vignette on each card */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          )
        })}
      </button>

      {/* Location pill label */}
      <div
        className="flex justify-center mt-1"
        style={{ opacity: t, transition: "opacity 0.3s" }}
      >
        <span
          className="font-inter text-[10px] text-white bg-zinc-950/95 backdrop-blur-sm px-2.5 py-1 rounded-full whitespace-nowrap border border-white/10"
        >
          {name}
          {photos.length > 4 && (
            <span className="text-white/30 ml-1">+{photos.length - 4}</span>
          )}
        </span>
      </div>
    </div>
  )
}

/* ─── Globe ────────────────────────────────────────────────────────────── */

interface PhotoGlobeProps {
  onOpenLocation?: (location: PhotoLocation) => void
  panelOpen?: boolean
}

export function PhotoGlobe({ onOpenLocation, panelOpen }: PhotoGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const phiRef = useRef(0)
  const thetaRef = useRef(0.3)
  const [locations, setLocations] = useState<PhotoLocation[]>([])
  const [markerPositions, setMarkerPositions] = useState<
    { loc: PhotoLocation; x: number; y: number; visible: boolean; depth: number }[]
  >([])
  const [globeSize, setGlobeSize] = useState(600)
  const isDragging = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })
  const autoRotate = useRef(true)
  const resumeTimer = useRef(0)
  const [zoomScale, setZoomScale] = useState(1.0)
  const zoomScaleRef = useRef(1.0)
  const zoomWrapperRef = useRef<HTMLDivElement>(null)

  // Load locations from JSON file
  useEffect(() => {
    fetchLocations().then(setLocations)
    const sync = () => fetchLocations().then(setLocations)
    window.addEventListener("storage", sync)
    window.addEventListener("photo-locations-changed", sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener("photo-locations-changed", sync)
    }
  }, [])

  // Responsive sizing
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setGlobeSize(Math.min(containerRef.current.clientWidth, 600))
      }
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  // Cobe instance
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let globe: ReturnType<typeof import("cobe")["default"]> | null = null

    ;(async () => {
      const createGlobe = (await import("cobe")).default
      if (!canvas) return
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio, 2),
        width: globeSize * 2,
        height: globeSize * 2,
        phi: phiRef.current,
        theta: thetaRef.current,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 20000,
        mapBrightness: 4,
        baseColor: [0.25, 0.25, 0.25],
        markerColor: [0.9, 0.9, 0.9],
        glowColor: [0.08, 0.08, 0.08],
        markers: locations.map((loc) => ({
          location: [loc.lat, loc.lng] as [number, number],
          size: 0.06 + Math.min(loc.photos.length, 10) * 0.008,
        })),
        onRender: (state) => {
          if (autoRotate.current && !isDragging.current) {
            phiRef.current += 0.0015
          }
          state.phi = phiRef.current
          state.theta = thetaRef.current
          state.width = globeSize * 2
          state.height = globeSize * 2
          setMarkerPositions(
            locations.map((loc) => ({
              loc,
              ...projectToScreen(loc.lat, loc.lng, phiRef.current, thetaRef.current, globeSize),
            })),
          )
        },
      })
    })()

    return () => { globe?.destroy() }
  }, [globeSize, locations])

  // Pointer handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true
    autoRotate.current = false
    lastPointer.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastPointer.current.x
    const dy = e.clientY - lastPointer.current.y
    phiRef.current += dx * 0.005 / zoomScaleRef.current
    thetaRef.current = Math.max(-1, Math.min(1, thetaRef.current - dy * 0.005 / zoomScaleRef.current))
    lastPointer.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onPointerUp = useCallback(() => {
    isDragging.current = false
    clearTimeout(resumeTimer.current)
    resumeTimer.current = window.setTimeout(() => { autoRotate.current = true }, 3000)
  }, [])

  // Wheel zoom — must be non-passive to preventDefault
  useEffect(() => {
    const el = zoomWrapperRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.08 : 0.08
      const next = Math.min(2.5, Math.max(0.6, zoomScaleRef.current + delta))
      zoomScaleRef.current = next
      setZoomScale(next)
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  const handleZoomIn = useCallback(() => {
    const next = Math.min(2.5, zoomScaleRef.current + 0.2)
    zoomScaleRef.current = next
    setZoomScale(next)
  }, [])

  const handleZoomOut = useCallback(() => {
    const next = Math.max(0.6, zoomScaleRef.current - 0.2)
    zoomScaleRef.current = next
    setZoomScale(next)
  }, [])

  const handleMarkerClick = useCallback(
    (loc: PhotoLocation) => onOpenLocation?.(loc),
    [onOpenLocation],
  )

  return (
    <div ref={containerRef} className="relative w-full flex items-center justify-center select-none">
      {/* Fixed-layout wrapper — clips zoomed globe to a circle */}
      <div
        ref={zoomWrapperRef}
        className="relative"
        style={{ width: globeSize, height: globeSize }}
      >
        {/* Scaled globe (canvas + vignette) — overflow-hidden gives circular crop when zoomed */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: "center center",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 0 60px 4px rgba(255,255,255,0.03)",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <canvas
            ref={canvasRef}
            className="rounded-full"
            style={{ width: globeSize, height: globeSize, cursor: "grab", display: "block" }}
          />
          {/* Edge vignette */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 50%, transparent 72%, rgba(0,0,0,0.55) 100%)" }}
          />
        </div>

        {/* Marker + card-fan overlays — positioned at zoom-adjusted screen coords so cards stay fixed size */}
        {!panelOpen && (
          <div className="absolute inset-0 pointer-events-none">
            {markerPositions
              .filter((m) => m.visible)
              .map((m) => {
                const opacity = Math.max(0.3, Math.min(1, (m.depth - 0.05) / 0.6))
                const showFan = m.depth > FAN_THRESHOLD && m.loc.photos.length > 0
                const dotSize = 8 + Math.min(m.loc.photos.length, 8) * 0.5
                // Adjust marker position to match the CSS-scaled globe
                const vx = globeSize / 2 + (m.x - globeSize / 2) * zoomScale
                const vy = globeSize / 2 + (m.y - globeSize / 2) * zoomScale
                // Hide markers that zoomed outside the circle
                const r = globeSize / 2
                const dx = vx - r, dy = vy - r
                if (dx * dx + dy * dy > r * r * 1.1) return null

                return (
                  <div
                    key={m.loc.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: vx,
                      top: vy,
                      transform: "translate(-50%, -50%)",
                      zIndex: showFan ? 200 : Math.round(m.depth * 100),
                    }}
                  >
                    {/* Card fan — fixed pixel size regardless of zoom */}
                    {showFan && (
                      <CardFan
                        photos={m.loc.photos}
                        depth={m.depth}
                        name={m.loc.name}
                        onClick={() => handleMarkerClick(m.loc)}
                      />
                    )}

                    {/* Pin dot */}
                    <button
                      className="relative flex items-center justify-center focus:outline-none pointer-events-auto"
                      style={{ width: 28, height: 28 }}
                      onClick={() => handleMarkerClick(m.loc)}
                    >
                      <span
                        className="block rounded-full bg-white transition-all duration-150"
                        style={{
                          width: dotSize,
                          height: dotSize,
                          opacity,
                          boxShadow: "0 0 6px 2px rgba(255,255,255,0.25)",
                        }}
                      />
                    </button>
                  </div>
                )
              })}
          </div>
        )}

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-10 pointer-events-auto">
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 bg-zinc-900/80 border border-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors text-base leading-none"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 bg-zinc-900/80 border border-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors text-base leading-none"
          >
            −
          </button>
        </div>

        {/* Empty state */}
        {locations.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="font-inter text-xs text-zinc-600 mb-1">No locations yet</p>
              <p className="font-inter text-[10px] text-zinc-700">Add photos with locations to see them here</p>
            </div>
          </div>
        )}

        {locations.length > 0 && (
          <div className="absolute bottom-3 left-3 pointer-events-none">
            <span className="font-inter text-[10px] text-white/20 tabular-nums">
              {locations.length} location{locations.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Photo Panel (lightbox opened on marker / card-fan click) ─────────── */

interface PhotoPanelProps {
  location: PhotoLocation | null
  onClose: () => void
  originX?: number
  originY?: number
}

export function PhotoPanel({ location, onClose, originX, originY }: PhotoPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)

  useEffect(() => {
    if (location) {
      requestAnimationFrame(() => setIsOpen(true))
      document.body.style.overflow = "hidden"
    } else {
      setIsOpen(false)
      document.body.style.overflow = "unset"
    }
    return () => { document.body.style.overflow = "unset" }
  }, [location])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedPhoto !== null) setSelectedPhoto(null)
        else handleClose()
      }
      if (selectedPhoto !== null && location) {
        if (e.key === "ArrowRight")
          setSelectedPhoto((p) => (p !== null ? (p + 1) % location.photos.length : 0))
        if (e.key === "ArrowLeft")
          setSelectedPhoto((p) =>
            p !== null ? (p - 1 + location.photos.length) % location.photos.length : 0,
          )
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [location, selectedPhoto])

  const handleClose = () => {
    setIsOpen(false)
    setSelectedPhoto(null)
    setTimeout(onClose, 350)
  }

  if (!location) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <style>{`
        .panel-backdrop { opacity:0; transition:opacity .35s ease }
        .panel-backdrop.open { opacity:1 }
        .panel-content {
          opacity:0; transform:scale(.3);
          transition: opacity .4s cubic-bezier(.16,1,.3,1), transform .4s cubic-bezier(.16,1,.3,1);
          transform-origin: ${originX ?? 50}px ${originY ?? 50}px;
        }
        .panel-content.open { opacity:1; transform:scale(1) }
      `}</style>

      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-xl panel-backdrop${isOpen ? " open" : ""}`}
        onClick={handleClose}
      />

      <div
        className={`relative bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col panel-content${isOpen ? " open" : ""}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/60">
          <div>
            <p className="font-inter text-xs uppercase tracking-[0.3em] text-zinc-600 mb-0.5">{location.type}</p>
            <h3 className="font-inter text-xl text-white">{location.name}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-inter text-xs text-zinc-600">
              {location.photos.length} photo{location.photos.length !== 1 ? "s" : ""}
            </span>
            <button onClick={handleClose} className="text-zinc-600 hover:text-white transition-colors p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {location.photos.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-inter text-sm text-zinc-500">No photos in this location yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {location.photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  className="group aspect-square rounded-xl overflow-hidden bg-zinc-900 relative hover:ring-2 hover:ring-white/20 transition-all duration-200"
                  onClick={() => setSelectedPhoto(idx)}
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption || ""}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selectedPhoto !== null && location.photos[selectedPhoto] && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center animate-in fade-in duration-200">
          <button
            className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-2 z-10"
            onClick={() => setSelectedPhoto(null)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {location.photos.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-zinc-900/80 hover:bg-zinc-800 rounded-full transition-colors"
                onClick={() =>
                  setSelectedPhoto((selectedPhoto - 1 + location.photos.length) % location.photos.length)
                }
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-zinc-900/80 hover:bg-zinc-800 rounded-full transition-colors"
                onClick={() => setSelectedPhoto((selectedPhoto + 1) % location.photos.length)}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          <div className="relative w-full h-[80vh] max-w-5xl">
            <Image
              src={location.photos[selectedPhoto].url}
              alt={location.photos[selectedPhoto].caption || ""}
              fill
              className="object-contain"
              sizes="100vw"
              quality={90}
              priority
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-900/80 rounded-full">
            <span className="text-white font-inter text-sm">
              {selectedPhoto + 1} of {location.photos.length}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
