"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface PixelModeContextType {
  isPixelMode: boolean
  togglePixelMode: () => void
}

const PixelModeContext = createContext<PixelModeContextType>({
  isPixelMode: false,
  togglePixelMode: () => {},
})

export function PixelModeProvider({ children }: { children: ReactNode }) {
  const [isPixelMode, setIsPixelMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("pixel-mode")
    if (stored === "true") {
      setIsPixelMode(true)
      document.documentElement.classList.add("pixel-mode")
    }
  }, [])

  const togglePixelMode = useCallback(() => {
    setIsPixelMode((prev) => {
      const next = !prev
      localStorage.setItem("pixel-mode", String(next))
      if (next) {
        document.documentElement.classList.add("pixel-mode")
      } else {
        document.documentElement.classList.remove("pixel-mode")
      }
      return next
    })
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <PixelModeContext.Provider value={{ isPixelMode, togglePixelMode }}>
      {children}
    </PixelModeContext.Provider>
  )
}

export function usePixelMode() {
  return useContext(PixelModeContext)
}
