"use client"

import { useRef, useEffect, useState, useCallback, useMemo } from "react"
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
  fanOpacity?: number
  depthThreshold?: number
}

function CardFan({ photos, depth, name, onClick, fanOpacity = 1, depthThreshold = FAN_THRESHOLD }: CardFanProps) {
  const t = Math.min(1, Math.max(0, (depth - depthThreshold) / (1 - depthThreshold)))
  const cards = photos.slice(0, 4)

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        bottom: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        marginBottom: 8,
        opacity: t * fanOpacity,
        transition: "opacity 0.2s ease-out",
        pointerEvents: fanOpacity < 0.5 ? "none" : "auto",
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
  const [expandedCluster, setExpandedCluster] = useState<Set<string> | null>(null)
  const [hoveredCluster, setHoveredCluster] = useState<number | null>(null)
  const [hoveredExpandedId, setHoveredExpandedId] = useState<string | null>(null)
  // Animation refs for smooth globe rotation + zoom on cluster expand
  const animatingRef = useRef(false)
  const targetPhiRef = useRef(0)
  const targetThetaRef = useRef(0.3)
  const targetZoomRef = useRef(1.0)

  // Screen-space clustering — expanded-cluster members render individually; rest cluster normally
  const { clusters, expandedPoints } = useMemo(() => {
    const CLUSTER_PX = 40
    const clusters: { locs: PhotoLocation[]; vx: number; vy: number; depth: number }[] = []
    const expandedPoints: { loc: PhotoLocation; vx: number; vy: number; depth: number }[] = []
    for (const m of markerPositions) {
      if (!m.visible) continue
      const vx = globeSize / 2 + (m.x - globeSize / 2) * zoomScale
      const vy = globeSize / 2 + (m.y - globeSize / 2) * zoomScale
      const r = globeSize / 2
      if ((vx - r) ** 2 + (vy - r) ** 2 > r * r * 1.1) continue
      // Expanded-cluster members skip clustering and render individually
      if (expandedCluster?.has(m.loc.id)) {
        expandedPoints.push({ loc: m.loc, vx, vy, depth: m.depth })
        continue
      }
      let merged = false
      for (const c of clusters) {
        if ((c.vx - vx) ** 2 + (c.vy - vy) ** 2 < CLUSTER_PX * CLUSTER_PX) {
          c.locs.push(m.loc)
          const n = c.locs.length
          c.vx = (c.vx * (n - 1) + vx) / n
          c.vy = (c.vy * (n - 1) + vy) / n
          c.depth = Math.max(c.depth, m.depth)
          merged = true
          break
        }
      }
      if (!merged) clusters.push({ locs: [m.loc], vx, vy, depth: m.depth })
    }
    return { clusters, expandedPoints }
  }, [markerPositions, zoomScale, globeSize, expandedCluster])

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

  // Responsive sizing — use both width and height to fill the flex container
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth
        const h = containerRef.current.clientHeight
        setGlobeSize(Math.min(w, h, 600))
      }
    }
    update()
    const ro = new ResizeObserver(update)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener("resize", update)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", update)
    }
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
        markers: [],
        // overlay dots outside the CSS-transform div handle marker rendering so they scale correctly with zoom
        onRender: (state) => {
          if (animatingRef.current) {
            const dphi   = targetPhiRef.current   - phiRef.current
            const dtheta = targetThetaRef.current  - thetaRef.current
            const dzoom  = targetZoomRef.current   - zoomScaleRef.current
            phiRef.current   += dphi   * 0.07
            thetaRef.current += dtheta * 0.07
            if (Math.abs(dzoom) > 0.003) {
              zoomScaleRef.current += dzoom * 0.07
              setZoomScale(zoomScaleRef.current)
            }
            if (Math.abs(dphi) < 0.003 && Math.abs(dtheta) < 0.002 && Math.abs(dzoom) < 0.003) {
              animatingRef.current = false
            }
          } else if (autoRotate.current && !isDragging.current) {
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
    animatingRef.current = false
    lastPointer.current = { x: e.clientX, y: e.clientY }
    setHoveredCluster(null)
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

  // Expand a multi-location cluster: zoom + rotate globe to geographic center, show individual markers
  const handleExpandCluster = useCallback(
    (c: { locs: PhotoLocation[]; vx: number; vy: number; depth: number }) => {
      if (c.locs.length === 1) { handleMarkerClick(c.locs[0]); return }
      const avgLat = c.locs.reduce((s, l) => s + l.lat, 0) / c.locs.length
      const avgLng = c.locs.reduce((s, l) => s + l.lng, 0) / c.locs.length
      // Compute phi that faces this longitude (lz maximised when lngR + phi = π/2)
      const lngR = avgLng * Math.PI / 180 - Math.PI
      let phiTarget = Math.PI / 2 - lngR
      // Normalize to shortest rotation from current phi
      const twoPi = 2 * Math.PI
      const delta = ((phiTarget - ((phiRef.current % twoPi) + twoPi)) % twoPi)
      phiTarget = phiRef.current + (delta > Math.PI ? delta - twoPi : delta < -Math.PI ? delta + twoPi : delta)
      const thetaTarget = Math.max(-1, Math.min(1, avgLat * Math.PI / 180))
      targetPhiRef.current   = phiTarget
      targetThetaRef.current = thetaTarget
      targetZoomRef.current  = Math.min(2.5, Math.max(zoomScaleRef.current + 0.7, 1.8))
      animatingRef.current   = true
      autoRotate.current     = false
      setExpandedCluster(new Set(c.locs.map((l) => l.id)))
      setHoveredCluster(null)
    },
    [handleMarkerClick],
  )

  // Escape key collapses the expanded cluster
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setExpandedCluster(null) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center select-none">
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

        {/* Cluster markers */}
        {!panelOpen && (
          <div className="absolute inset-0 pointer-events-none">
            {clusters.map((c, i) => {
              const isMulti = c.locs.length > 1
              const opacity = Math.max(0.3, Math.min(1, (c.depth - 0.05) / 0.6))
              const mainLoc = c.locs.reduce((a, b) => (a.photos.length >= b.photos.length ? a : b))
              const isHovered = hoveredCluster === i
              // Single: show fan on hover. Multi: show fan preview of richest loc on hover
              const showFan = isHovered && c.depth > FAN_THRESHOLD && mainLoc.photos.length > 0
              const dotSize = (5 + Math.min(mainLoc.photos.length, 8) * 0.4) * zoomScale

              return (
                <div
                  key={i}
                  className="absolute pointer-events-none"
                  style={{
                    left: c.vx,
                    top: c.vy,
                    transform: "translate(-50%, -50%)",
                    zIndex: isHovered ? 200 : Math.round(c.depth * 100),
                  }}
                  onMouseEnter={() => setHoveredCluster(i)}
                  onMouseLeave={() => setHoveredCluster(null)}
                >
                  {/* Card fan preview on hover */}
                  {showFan && (
                    <CardFan
                      photos={mainLoc.photos}
                      depth={c.depth}
                      name={isMulti ? `${mainLoc.name} +${c.locs.length - 1} more` : mainLoc.name}
                      onClick={() => isMulti ? handleExpandCluster(c) : handleMarkerClick(c.locs[0])}
                    />
                  )}

                  {/* Pin dot */}
                  <button
                    className="relative flex items-center justify-center focus:outline-none pointer-events-auto"
                    style={{ width: Math.max(28, dotSize + 10), height: Math.max(28, dotSize + 10) }}
                    onClick={() => isMulti ? handleExpandCluster(c) : handleMarkerClick(c.locs[0])}
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
                    {/* Cluster count badge */}
                    {isMulti && (
                      <span
                        className="absolute -top-1 -right-1 bg-zinc-900 border border-zinc-600 text-white rounded-full flex items-center justify-center font-inter font-semibold pointer-events-none"
                        style={{ fontSize: 9, width: 15, height: 15, lineHeight: 1 }}
                      >
                        {c.locs.length}
                      </span>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Expanded cluster — individual markers with low-opacity fans; hover fades fan so dot pops */}
        {!panelOpen && expandedPoints.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Collapse hint */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[300] pointer-events-auto">
              <button
                className="font-inter text-[10px] text-zinc-500 hover:text-zinc-300 bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 rounded-full transition-colors"
                onClick={() => setExpandedCluster(null)}
              >
                ← collapse group
              </button>
            </div>
            {expandedPoints.map((ep) => {
              const isHov = hoveredExpandedId === ep.loc.id
              const dotOpacity = isHov ? 1 : Math.max(0.5, Math.min(1, (ep.depth - 0.05) / 0.6))
              // Fan cards: semi-transparent by default, nearly invisible on hover so dot stands out
              const fanOpacity = isHov ? 0.07 : 0.28
              const dotSize = (5 + Math.min(ep.loc.photos.length, 8) * 0.4) * zoomScale
              const showFan = ep.loc.photos.length > 0 && ep.depth > 0.05

              return (
                <div
                  key={ep.loc.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: ep.vx,
                    top: ep.vy,
                    transform: "translate(-50%, -50%)",
                    zIndex: isHov ? 250 : Math.round(ep.depth * 100),
                    transition: "z-index 0s",
                  }}
                  onMouseEnter={() => setHoveredExpandedId(ep.loc.id)}
                  onMouseLeave={() => setHoveredExpandedId(null)}
                >
                  {showFan && (
                    <CardFan
                      photos={ep.loc.photos}
                      depth={ep.depth}
                      name={ep.loc.name}
                      onClick={() => handleMarkerClick(ep.loc)}
                      fanOpacity={fanOpacity}
                      depthThreshold={0.05}
                    />
                  )}

                  <button
                    className="relative flex items-center justify-center focus:outline-none pointer-events-auto"
                    style={{ width: Math.max(28, dotSize + 10), height: Math.max(28, dotSize + 10) }}
                    onClick={() => handleMarkerClick(ep.loc)}
                  >
                    <span
                      className="block rounded-full bg-white transition-all duration-200"
                      style={{
                        width: isHov ? dotSize * 1.3 : dotSize,
                        height: isHov ? dotSize * 1.3 : dotSize,
                        opacity: dotOpacity,
                        boxShadow: isHov
                          ? "0 0 10px 4px rgba(255,255,255,0.5)"
                          : "0 0 6px 2px rgba(255,255,255,0.25)",
                      }}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Zoom controls — offset 100px further right of the globe edge */}
        <div className="absolute top-3 flex flex-col gap-1 z-10 pointer-events-auto" style={{ right: "-100px" }}>
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
