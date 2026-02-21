"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export type PixelTheme = "modern" | "midnight" | "neo-tokyo" | "sakura" | "phosphor"

export const PIXEL_THEMES: {
  id: PixelTheme
  name: string
  description: string
  colors: [string, string]
}[] = [
  { id: "modern", name: "Modern", description: "Default clean UI", colors: ["#27272a", "#52525b"] },
  { id: "midnight", name: "Midnight Cipher", description: "Violet & amber hacker aesthetic", colors: ["#7c3aed", "#f59e0b"] },
  { id: "neo-tokyo", name: "Neo Tokyo", description: "Crimson & cyan cyberpunk", colors: ["#ff2d55", "#00b4d8"] },
  { id: "sakura", name: "Sakura", description: "Cherry blossom serenity", colors: ["#e8729a", "#f9a8d4"] },
  { id: "phosphor", name: "Phosphor", description: "Terminal green on black", colors: ["#22c55e", "#052e05"] },
]

interface PixelModeContextType {
  theme: PixelTheme
  setTheme: (theme: PixelTheme) => void
  isPixelMode: boolean
}

const PixelModeContext = createContext<PixelModeContextType>({
  theme: "modern",
  setTheme: () => {},
  isPixelMode: false,
})

export function PixelModeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<PixelTheme>("modern")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("pixel-theme") as PixelTheme | null
    if (stored && PIXEL_THEMES.some((t) => t.id === stored)) {
      setThemeState(stored)
      applyThemeClasses(stored)
    }
  }, [])

  const applyThemeClasses = (t: PixelTheme) => {
    const html = document.documentElement
    // Remove all theme classes
    html.classList.remove("pixel-mode")
    PIXEL_THEMES.forEach((pt) => html.classList.remove(`pixel-theme-${pt.id}`))
    // Apply new ones
    if (t !== "modern") {
      html.classList.add("pixel-mode", `pixel-theme-${t}`)
    }
  }

  const setTheme = useCallback((t: PixelTheme) => {
    setThemeState(t)
    localStorage.setItem("pixel-theme", t)
    applyThemeClasses(t)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <PixelModeContext.Provider value={{ theme, setTheme, isPixelMode: theme !== "modern" }}>
      {children}
    </PixelModeContext.Provider>
  )
}

export function usePixelMode() {
  return useContext(PixelModeContext)
}
