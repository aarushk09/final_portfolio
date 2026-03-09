"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import type { PhotoLocation, LocationPhoto } from "@/lib/photo-locations"
import { PRESET_LOCATIONS } from "@/lib/photo-locations"

// ── Types ──────────────────────────────────────────────────────────────────────

interface CodebasePhoto {
  id: string
  url: string
  name: string
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function UploadPhotosPage() {
  // All photos from public/photos/
  const [allPhotos, setAllPhotos] = useState<CodebasePhoto[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(true)
  const [photoPage, setPhotoPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  // The locations we're building (in-memory, exported to JSON)
  const [locations, setLocations] = useState<PhotoLocation[]>([])

  // UI state
  const [view, setView] = useState<"main" | "create" | "edit">("main")
  const [editingId, setEditingId] = useState<string | null>(null)

  // Create-location form
  const [newName, setNewName] = useState("")
  const [newLat, setNewLat] = useState("")
  const [newLng, setNewLng] = useState("")
  const [newType, setNewType] = useState<"city" | "state" | "country">("city")
  const [presetSearch, setPresetSearch] = useState("")
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())

  // Load existing locations from the JSON file on mount
  useEffect(() => {
    fetch("/photo-locations.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: PhotoLocation[]) => {
        if (Array.isArray(data)) setLocations(data)
      })
      .catch(() => {})
  }, [])

  // Load codebase photos
  useEffect(() => {
    setLoadingPhotos(true)
    fetch(`/api/photos?limit=200&page=1`)
      .then((r) => r.json())
      .then((data) => {
        setAllPhotos(data.photos || [])
        setHasMore(data.hasMore || false)
        setLoadingPhotos(false)
      })
      .catch(() => setLoadingPhotos(false))
  }, [])

  // ── Helpers ────────────────────────────────────────────────────────────────

  const togglePhoto = (id: string) => {
    setSelectedPhotos((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCreateFromPreset = (preset: (typeof PRESET_LOCATIONS)[0]) => {
    setNewName(preset.name)
    setNewLat(String(preset.lat))
    setNewLng(String(preset.lng))
    setNewType(preset.type)
  }

  const handleCreateLocation = () => {
    const lat = parseFloat(newLat)
    const lng = parseFloat(newLng)
    if (!newName.trim() || isNaN(lat) || isNaN(lng)) return

    const photos: LocationPhoto[] = allPhotos
      .filter((p) => selectedPhotos.has(p.id))
      .map((p) => ({ id: crypto.randomUUID(), url: p.url }))

    const newLoc: PhotoLocation = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      type: newType,
      lat,
      lng,
      photos,
    }

    setLocations((prev) => [...prev, newLoc])
    resetCreateForm()
    setView("main")
  }

  const resetCreateForm = () => {
    setNewName("")
    setNewLat("")
    setNewLng("")
    setNewType("city")
    setPresetSearch("")
    setSelectedPhotos(new Set())
  }

  const handleDeleteLocation = (id: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setView("main")
    }
  }

  const handleRemovePhotoFromLocation = (locId: string, photoId: string) => {
    setLocations((prev) =>
      prev.map((l) =>
        l.id === locId ? { ...l, photos: l.photos.filter((p) => p.id !== photoId) } : l,
      ),
    )
  }

  const handleAddPhotosToLocation = (locId: string) => {
    const loc = locations.find((l) => l.id === locId)
    if (!loc) return
    const existingUrls = new Set(loc.photos.map((p) => p.url))
    const newPhotos: LocationPhoto[] = allPhotos
      .filter((p) => selectedPhotos.has(p.id) && !existingUrls.has(p.url))
      .map((p) => ({ id: crypto.randomUUID(), url: p.url }))

    setLocations((prev) =>
      prev.map((l) => (l.id === locId ? { ...l, photos: [...l.photos, ...newPhotos] } : l)),
    )
    setSelectedPhotos(new Set())
  }

  // ── Export JSON ────────────────────────────────────────────────────────────

  const handleExport = () => {
    const json = JSON.stringify(locations, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "photo-locations.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSaveToProject = async () => {
    try {
      const res = await fetch("/api/save-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locations),
      })
      if (res.ok) {
        alert("Saved! The globe will now use your updated locations.")
      } else {
        alert("Failed to save. Check the console.")
      }
    } catch {
      alert("Failed to save.")
    }
  }

  // ── Filtered presets ───────────────────────────────────────────────────────

  const filteredPresets = PRESET_LOCATIONS.filter(
    (p) =>
      p.name.toLowerCase().includes(presetSearch.toLowerCase()) &&
      !locations.some((l) => l.name === p.name),
  )

  const editingLocation = locations.find((l) => l.id === editingId)

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-inter text-xs text-zinc-500 hover:text-white transition-colors"
            >
              &larr; Back
            </Link>
            <div>
              <h1 className="font-inter text-lg text-white">Photo Manager</h1>
              <p className="font-inter text-[11px] text-zinc-600">
                Manage globe locations &amp; photos &middot; {locations.length} location{locations.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="font-inter text-xs text-zinc-400 border border-zinc-700 px-4 py-2 rounded-lg hover:border-zinc-500 hover:text-white transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={handleSaveToProject}
              className="font-inter text-xs text-black bg-white px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors font-medium"
            >
              Save to Project
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ── MAIN VIEW: Location list ─────────────────────────────────── */}
        {view === "main" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="font-inter text-xs uppercase tracking-[0.3em] text-zinc-600">
                Locations
              </p>
              <button
                onClick={() => { resetCreateForm(); setView("create") }}
                className="font-inter text-xs bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-lg hover:border-zinc-500 text-zinc-300 hover:text-white transition-colors"
              >
                + New Location
              </button>
            </div>

            {locations.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
                <p className="font-inter text-sm text-zinc-500 mb-2">No locations yet</p>
                <p className="font-inter text-xs text-zinc-700">
                  Create a location and assign photos from your codebase
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-5 hover:border-zinc-700/60 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-inter text-sm text-white font-medium">{loc.name}</h3>
                        <p className="font-inter text-[11px] text-zinc-600">
                          {loc.type} &middot; {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)} &middot;{" "}
                          {loc.photos.length} photo{loc.photos.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditingId(loc.id); setSelectedPhotos(new Set()); setView("edit") }}
                          className="font-inter text-[11px] text-zinc-500 hover:text-white border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(loc.id)}
                          className="font-inter text-[11px] text-red-500/60 hover:text-red-400 border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Photo thumbnails */}
                    {loc.photos.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {loc.photos.slice(0, 8).map((photo) => (
                          <div
                            key={photo.id}
                            className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900"
                          >
                            <Image src={photo.url} alt="" fill className="object-cover" sizes="64px" />
                          </div>
                        ))}
                        {loc.photos.length > 8 && (
                          <div className="w-16 h-16 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0">
                            <span className="font-inter text-[11px] text-zinc-500">
                              +{loc.photos.length - 8}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CREATE VIEW: New location + photo selection ──────────────── */}
        {view === "create" && (
          <div>
            <button
              onClick={() => setView("main")}
              className="font-inter text-xs text-zinc-500 hover:text-white mb-6 transition-colors"
            >
              &larr; Back to locations
            </button>

            <h2 className="font-inter text-lg text-white mb-6">New Location</h2>

            {/* Preset quick-select */}
            <div className="mb-6">
              <p className="font-inter text-xs text-zinc-500 mb-3">Quick select a preset</p>
              <input
                type="text"
                placeholder="Search presets..."
                value={presetSearch}
                onChange={(e) => setPresetSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 font-inter text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 mb-3"
              />
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                {filteredPresets.slice(0, 20).map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleCreateFromPreset(preset)}
                    className={`text-left px-3 py-2 rounded-lg border text-xs font-inter transition-colors ${
                      newName === preset.name
                        ? "border-white/30 bg-white/10 text-white"
                        : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual entry */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="font-inter text-[11px] text-zinc-500 mb-1 block">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Location name"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 font-inter text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                />
              </div>
              <div>
                <label className="font-inter text-[11px] text-zinc-500 mb-1 block">Latitude</label>
                <input
                  type="text"
                  value={newLat}
                  onChange={(e) => setNewLat(e.target.value)}
                  placeholder="e.g. 37.7749"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 font-inter text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                />
              </div>
              <div>
                <label className="font-inter text-[11px] text-zinc-500 mb-1 block">Longitude</label>
                <input
                  type="text"
                  value={newLng}
                  onChange={(e) => setNewLng(e.target.value)}
                  placeholder="e.g. -122.4194"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 font-inter text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="font-inter text-[11px] text-zinc-500 mb-1 block">Type</label>
              <div className="flex gap-2">
                {(["city", "state", "country"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewType(t)}
                    className={`font-inter text-xs px-4 py-2 rounded-lg border transition-colors ${
                      newType === t
                        ? "border-white/30 bg-white/10 text-white"
                        : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo selection grid */}
            <div className="mb-6">
              <p className="font-inter text-xs text-zinc-500 mb-3">
                Select photos ({selectedPhotos.size} selected)
              </p>
              {loadingPhotos ? (
                <p className="font-inter text-xs text-zinc-600">Loading photos...</p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[400px] overflow-y-auto rounded-xl border border-zinc-800/60 p-3 bg-zinc-950">
                  {allPhotos.map((photo) => {
                    const isSelected = selectedPhotos.has(photo.id)
                    return (
                      <button
                        key={photo.id}
                        onClick={() => togglePhoto(photo.id)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          isSelected ? "border-white ring-1 ring-white/30" : "border-transparent hover:border-zinc-600"
                        }`}
                      >
                        <Image src={photo.url} alt={photo.name} fill className="object-cover" sizes="80px" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateLocation}
                disabled={!newName.trim() || isNaN(parseFloat(newLat)) || isNaN(parseFloat(newLng))}
                className="font-inter text-sm bg-white text-black px-6 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors font-medium disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Create Location
              </button>
              <button
                onClick={() => setView("main")}
                className="font-inter text-sm text-zinc-500 border border-zinc-800 px-6 py-2.5 rounded-lg hover:border-zinc-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── EDIT VIEW: Edit location photos ──────────────────────────── */}
        {view === "edit" && editingLocation && (
          <div>
            <button
              onClick={() => { setView("main"); setEditingId(null); setSelectedPhotos(new Set()) }}
              className="font-inter text-xs text-zinc-500 hover:text-white mb-6 transition-colors"
            >
              &larr; Back to locations
            </button>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-inter text-lg text-white">{editingLocation.name}</h2>
                <p className="font-inter text-[11px] text-zinc-600">
                  {editingLocation.type} &middot; {editingLocation.lat.toFixed(4)},{" "}
                  {editingLocation.lng.toFixed(4)}
                </p>
              </div>
            </div>

            {/* Current photos */}
            <div className="mb-8">
              <p className="font-inter text-xs text-zinc-500 mb-3">
                Current photos ({editingLocation.photos.length})
              </p>
              {editingLocation.photos.length === 0 ? (
                <p className="font-inter text-xs text-zinc-700 py-8 text-center border border-dashed border-zinc-800 rounded-xl">
                  No photos assigned yet
                </p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {editingLocation.photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
                      <Image src={photo.url} alt="" fill className="object-cover" sizes="80px" />
                      <button
                        onClick={() => handleRemovePhotoFromLocation(editingLocation.id, photo.id)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add more photos */}
            <div>
              <p className="font-inter text-xs text-zinc-500 mb-3">
                Add photos ({selectedPhotos.size} selected)
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[400px] overflow-y-auto rounded-xl border border-zinc-800/60 p-3 bg-zinc-950">
                {allPhotos.map((photo) => {
                  const isSelected = selectedPhotos.has(photo.id)
                  const alreadyAdded = editingLocation.photos.some((p) => p.url === photo.url)
                  return (
                    <button
                      key={photo.id}
                      onClick={() => !alreadyAdded && togglePhoto(photo.id)}
                      disabled={alreadyAdded}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        alreadyAdded
                          ? "border-zinc-700 opacity-40 cursor-not-allowed"
                          : isSelected
                            ? "border-white ring-1 ring-white/30"
                            : "border-transparent hover:border-zinc-600"
                      }`}
                    >
                      <Image src={photo.url} alt={photo.name} fill className="object-cover" sizes="80px" />
                      {isSelected && !alreadyAdded && (
                        <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                      {alreadyAdded && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="font-inter text-[9px] text-zinc-400">Added</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              {selectedPhotos.size > 0 && (
                <button
                  onClick={() => handleAddPhotosToLocation(editingLocation.id)}
                  className="mt-3 font-inter text-sm bg-white text-black px-6 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors font-medium"
                >
                  Add {selectedPhotos.size} Photo{selectedPhotos.size !== 1 ? "s" : ""}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
