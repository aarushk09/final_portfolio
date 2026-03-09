"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import {
  getLocations,
  saveLocations,
  addLocation,
  removeLocation,
  addPhotoToLocation,
  removePhotoFromLocation,
  PRESET_LOCATIONS,
} from "@/lib/photo-locations"
import type { PhotoLocation } from "@/lib/photo-locations"

// ── Codebase Photo Picker ──────────────────────────────────────────────────────
interface CodebasePhoto {
  id: string
  url: string
  name: string
}

interface PhotoPickerProps {
  locationId: string
  onDone: () => void
}

function CodebasePhotoPicker({ locationId, onDone }: PhotoPickerProps) {
  const [photos, setPhotos] = useState<CodebasePhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const PER_PAGE = 30

  useEffect(() => {
    setLoading(true)
    fetch(`/api/photos?limit=${PER_PAGE}&page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        if (page === 1) setPhotos(data.photos || [])
        else setPhotos((prev) => [...prev, ...(data.photos || [])])
        setHasMore(data.hasMore || false)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page])

  const filtered = photos.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAdd = async () => {
    if (selected.size === 0) return
    setSaving(true)
    const toAdd = photos.filter((p) => selected.has(p.id))
    for (const photo of toAdd) {
      addPhotoToLocation(locationId, { url: photo.url })
    }
    window.dispatchEvent(new Event("photo-locations-changed"))
    setSaving(false)
    onDone()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 flex-shrink-0">
        <div>
          <p className="font-inter text-xs uppercase tracking-[0.3em] text-zinc-600 mb-0.5">Select Photos</p>
          <p className="font-inter text-sm text-white">
            {selected.size} selected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDone}
            className="font-inter text-xs text-zinc-600 hover:text-zinc-400 px-3 py-1.5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={selected.size === 0 || saving}
            className="font-inter text-xs text-white bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-1.5 rounded-lg transition-colors"
          >
            {saving ? "Adding..." : `Add ${selected.size > 0 ? selected.size : ""}`}
          </button>
        </div>
      </div>

      <div className="px-6 py-3 flex-shrink-0 border-b border-zinc-800/40">
        <input
          type="text"
          placeholder="Filter photos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 font-inter text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading && page === 1 ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-inter text-xs text-zinc-600">No photos found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {filtered.map((photo) => {
                const isSel = selected.has(photo.id)
                return (
                  <button
                    key={photo.id}
                    onClick={() => toggle(photo.id)}
                    className="relative aspect-square rounded-lg overflow-hidden bg-zinc-900 focus:outline-none transition-all duration-150"
                    style={{
                      boxShadow: isSel ? "0 0 0 2px rgba(255,255,255,0.7)" : "none",
                    }}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.name}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                    {isSel && (
                      <div className="absolute inset-0 bg-white/10 flex items-end justify-end p-1.5">
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            {hasMore && !search && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                  className="font-inter text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-800 px-4 py-2 rounded-lg transition-colors disabled:opacity-40"
                >
                  {loading ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Location Row ───────────────────────────────────────────────────────────────
interface LocationRowProps {
  loc: PhotoLocation
  onPickPhotos: (id: string) => void
  onRemove: (id: string) => void
  onRemovePhoto: (locId: string, photoId: string) => void
}

function LocationRow({ loc, onPickPhotos, onRemove, onRemovePhoto }: LocationRowProps) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-inter text-[10px] uppercase tracking-wider text-zinc-700 flex-shrink-0">{loc.type}</span>
          <span className="font-inter text-sm text-zinc-200 truncate">{loc.name}</span>
          <span className="font-inter text-[10px] text-zinc-600 flex-shrink-0">
            {loc.photos.length} {loc.photos.length === 1 ? "photo" : "photos"}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <button
            className="font-inter text-[10px] text-zinc-600 hover:text-zinc-300 px-2 py-1 rounded border border-zinc-800 hover:border-zinc-700 transition-colors"
            onClick={(e) => { e.stopPropagation(); onPickPhotos(loc.id) }}
          >
            + Photos
          </button>
          <button
            className="font-inter text-[10px] text-zinc-700 hover:text-red-500 transition-colors px-1"
            onClick={(e) => { e.stopPropagation(); onRemove(loc.id) }}
          >
            ✕
          </button>
          <span className={`text-zinc-700 text-xs transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>▾</span>
        </div>
      </div>

      {expanded && loc.photos.length > 0 && (
        <div className="border-t border-zinc-800/40 p-3">
          <div className="flex flex-wrap gap-2">
            {loc.photos.map((photo) => (
              <div key={photo.id} className="relative group w-14 h-14 rounded-lg overflow-hidden bg-zinc-900">
                <Image src={photo.url} alt="" fill className="object-cover" sizes="56px" />
                <button
                  onClick={() => onRemovePhoto(loc.id, photo.id)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── PhotoLocationManager ───────────────────────────────────────────────────────
interface Props {
  isOpen: boolean
  onClose: () => void
}

export function PhotoLocationManager({ isOpen, onClose }: Props) {
  const [locations, setLocations] = useState<PhotoLocation[]>([])
  const [view, setView] = useState<"list" | "add" | "picker">("list")
  const [pickerLocId, setPickerLocId] = useState<string | null>(null)
  const [customName, setCustomName] = useState("")
  const [customLat, setCustomLat] = useState("")
  const [customLng, setCustomLng] = useState("")
  const [customType, setCustomType] = useState<"city" | "state" | "country">("city")
  const [presetSearch, setPresetSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  const refresh = useCallback(() => setLocations(getLocations()), [])

  useEffect(() => {
    refresh()
    window.addEventListener("photo-locations-changed", refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener("photo-locations-changed", refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [refresh])

  useEffect(() => {
    if (!isOpen) { setView("list"); setPickerLocId(null) }
  }, [isOpen])

  const handleAddPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    addLocation(preset)
    window.dispatchEvent(new Event("photo-locations-changed"))
    refresh()
    setView("list")
  }

  const handleAddCustom = () => {
    const lat = parseFloat(customLat)
    const lng = parseFloat(customLng)
    if (!customName.trim() || isNaN(lat) || isNaN(lng)) return
    addLocation({ name: customName.trim(), type: customType, lat, lng })
    window.dispatchEvent(new Event("photo-locations-changed"))
    refresh()
    setCustomName(""); setCustomLat(""); setCustomLng("")
    setView("list")
  }

  const handleRemoveLocation = (id: string) => {
    removeLocation(id)
    window.dispatchEvent(new Event("photo-locations-changed"))
    refresh()
  }

  const handleRemovePhoto = (locId: string, photoId: string) => {
    removePhotoFromLocation(locId, photoId)
    window.dispatchEvent(new Event("photo-locations-changed"))
    refresh()
  }

  const filteredPresets = PRESET_LOCATIONS.filter(
    (p) =>
      p.name.toLowerCase().includes(presetSearch.toLowerCase()) &&
      !locations.some((l) => l.name === p.name)
  )

  const slideStyle = {
    transform: isOpen ? "translateX(0)" : "translateX(100%)",
    transition: "transform 0.32s cubic-bezier(0.22,1,0.36,1)",
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        ref={ref}
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-zinc-950 border-l border-zinc-800 shadow-2xl"
        style={{ width: "min(480px, 100vw)", ...slideStyle }}
      >
        {/* ─ HEADER ─ */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/60 flex-shrink-0">
          {view === "list" && (
            <>
              <div>
                <p className="font-inter text-xs uppercase tracking-[0.3em] text-zinc-600 mb-0.5">Globe</p>
                <h2 className="font-inter text-lg text-white">Locations</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView("add")}
                  className="font-inter text-xs text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  + Add Location
                </button>
                <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </>
          )}
          {view === "add" && (
            <>
              <div>
                <button onClick={() => setView("list")} className="flex items-center gap-1.5 text-zinc-600 hover:text-white transition-colors mb-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-inter text-[10px]">back</span>
                </button>
                <h2 className="font-inter text-lg text-white">Add Location</h2>
              </div>
              <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
          {view === "picker" && (
            <>
              <button onClick={() => { setView("list"); setPickerLocId(null) }} className="flex items-center gap-1.5 text-zinc-600 hover:text-white transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-inter text-[10px]">back</span>
              </button>
              <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* ─ BODY ─ */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* LIST VIEW */}
          {view === "list" && (
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {locations.length === 0 ? (
                <div className="text-center py-20">
                  <p className="font-inter text-sm text-zinc-600 mb-2">No locations yet</p>
                  <button
                    onClick={() => setView("add")}
                    className="font-inter text-xs text-zinc-500 hover:text-white border border-zinc-800 px-4 py-2 rounded-lg transition-colors"
                  >
                    Add your first location
                  </button>
                </div>
              ) : (
                locations.map((loc) => (
                  <LocationRow
                    key={loc.id}
                    loc={loc}
                    onPickPhotos={(id) => { setPickerLocId(id); setView("picker") }}
                    onRemove={handleRemoveLocation}
                    onRemovePhoto={handleRemovePhoto}
                  />
                ))
              )}
            </div>
          )}

          {/* ADD VIEW */}
          {view === "add" && (
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Preset search */}
              <p className="font-inter text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-3">Quick Add</p>
              <input
                type="text"
                placeholder="Search cities..."
                value={presetSearch}
                onChange={(e) => setPresetSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 font-inter text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 mb-3 transition-colors"
              />
              <div className="grid grid-cols-2 gap-2 mb-8">
                {filteredPresets.slice(0, 12).map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleAddPreset(preset)}
                    className="text-left px-3 py-2.5 rounded-lg border border-zinc-800 hover:border-zinc-600 hover:bg-white/[0.03] transition-all group"
                  >
                    <p className="font-inter text-xs text-zinc-300 group-hover:text-white transition-colors">{preset.name}</p>
                    <p className="font-inter text-[10px] text-zinc-700 capitalize">{preset.type}</p>
                  </button>
                ))}
                {filteredPresets.length === 0 && (
                  <p className="font-inter text-xs text-zinc-700 col-span-2 py-2">No matches</p>
                )}
              </div>

              {/* Custom */}
              <p className="font-inter text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-3">Custom Location</p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Location name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 font-inter text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Latitude (e.g. 37.77)"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 font-inter text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Longitude (e.g. -122.4)"
                    value={customLng}
                    onChange={(e) => setCustomLng(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 font-inter text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as "city" | "state" | "country")}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 font-inter text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 transition-colors"
                >
                  <option value="city">City</option>
                  <option value="state">State / Region</option>
                  <option value="country">Country</option>
                </select>
                <button
                  onClick={handleAddCustom}
                  disabled={!customName.trim() || !customLat || !customLng}
                  className="w-full font-inter text-xs text-white bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed py-2.5 rounded-lg transition-colors"
                >
                  Add Location
                </button>
              </div>
            </div>
          )}

          {/* PICKER VIEW */}
          {view === "picker" && pickerLocId && (
            <CodebasePhotoPicker
              locationId={pickerLocId}
              onDone={() => { setView("list"); setPickerLocId(null); refresh() }}
            />
          )}
        </div>
      </div>
    </>
  )
}
