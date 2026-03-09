export interface PhotoLocation {
  id: string
  name: string
  type: "country" | "state" | "city"
  lat: number
  lng: number
  photos: LocationPhoto[]
}

export interface LocationPhoto {
  id: string
  url: string
  thumbnail?: string
  caption?: string
}

// In-memory cache of locations loaded from the JSON file
let cachedLocations: PhotoLocation[] | null = null

/**
 * Fetch locations from the static JSON file.
 * Returns cached version if already loaded.
 * Call `reloadLocations()` to force a re-fetch.
 */
export async function fetchLocations(): Promise<PhotoLocation[]> {
  if (cachedLocations !== null) return cachedLocations
  try {
    const res = await fetch("/photo-locations.json", { cache: "no-store" })
    if (!res.ok) return []
    const data: PhotoLocation[] = await res.json()
    cachedLocations = data
    return data
  } catch {
    return []
  }
}

/** Synchronous getter – returns whatever was last fetched (or []). */
export function getLocations(): PhotoLocation[] {
  return cachedLocations ?? []
}

/** Force the next `fetchLocations` to re-read from disk. */
export function reloadLocations() {
  cachedLocations = null
}

/** Set the in-memory cache directly (used by the management page before export). */
export function setLocations(locations: PhotoLocation[]) {
  cachedLocations = locations
}

// Preset locations for quick selection
export const PRESET_LOCATIONS: Omit<PhotoLocation, "id" | "photos">[] = [
  { name: "New York City", type: "city", lat: 40.7128, lng: -74.006 },
  { name: "San Francisco", type: "city", lat: 37.7749, lng: -122.4194 },
  { name: "Los Angeles", type: "city", lat: 34.0522, lng: -118.2437 },
  { name: "Chicago", type: "city", lat: 41.8781, lng: -87.6298 },
  { name: "Atlanta", type: "city", lat: 33.749, lng: -84.388 },
  { name: "Cumming, GA", type: "city", lat: 34.2073, lng: -84.1402 },
  { name: "London", type: "city", lat: 51.5074, lng: -0.1278 },
  { name: "Paris", type: "city", lat: 48.8566, lng: 2.3522 },
  { name: "Tokyo", type: "city", lat: 35.6762, lng: 139.6503 },
  { name: "Dubai", type: "city", lat: 25.2048, lng: 55.2708 },
  { name: "Sydney", type: "city", lat: -33.8688, lng: 151.2093 },
  { name: "Berlin", type: "city", lat: 52.52, lng: 13.405 },
  { name: "Toronto", type: "city", lat: 43.6532, lng: -79.3832 },
  { name: "Seoul", type: "city", lat: 37.5665, lng: 126.978 },
  { name: "Mumbai", type: "city", lat: 19.076, lng: 72.8777 },
  { name: "Singapore", type: "city", lat: 1.3521, lng: 103.8198 },
  { name: "Rome", type: "city", lat: 41.9028, lng: 12.4964 },
  { name: "Barcelona", type: "city", lat: 41.3851, lng: 2.1734 },
  { name: "Istanbul", type: "city", lat: 41.0082, lng: 28.9784 },
  { name: "Bangkok", type: "city", lat: 13.7563, lng: 100.5018 },
  { name: "Mexico City", type: "city", lat: 19.4326, lng: -99.1332 },
  { name: "Cairo", type: "city", lat: 30.0444, lng: 31.2357 },
  { name: "Rio de Janeiro", type: "city", lat: -22.9068, lng: -43.1729 },
  { name: "Amsterdam", type: "city", lat: 52.3676, lng: 4.9041 },
  { name: "Washington, D.C.", type: "city", lat: 38.9072, lng: -77.0369 },
]
