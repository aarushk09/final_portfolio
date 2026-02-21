"use client"

import { useState, useRef, useEffect } from "react"
import { usePixelMode, PIXEL_THEMES, type PixelTheme } from "@/contexts/pixel-mode-context"
import { Palette, X, ChevronDown } from "lucide-react"
import { SakuraPetals } from "@/components/sakura-petals"

export function PixelModeToggle() {
  const { theme, setTheme, isPixelMode } = usePixelMode()
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const currentTheme = PIXEL_THEMES.find((t) => t.id === theme)!

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return (
    <>
      {/* Sakura petals overlay -- only when sakura theme active */}
      {theme === "sakura" && <SakuraPetals />}

      <div ref={panelRef} className="fixed top-6 left-6 z-50">
        {/* Trigger button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Open theme selector"
          className={`
            flex items-center gap-2.5 px-3.5 py-2 transition-all duration-300 group
            ${isPixelMode
              ? "pixel-toggle-btn border-2 text-[var(--pixel-accent)]"
              : "bg-zinc-900/70 backdrop-blur-md border border-zinc-700/50 rounded-full text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
            }
          `}
        >
          <Palette className="w-3.5 h-3.5" />
          <span
            className="uppercase tracking-wider"
            style={{
              fontFamily: isPixelMode ? "var(--font-pixel)" : "var(--font-inter)",
              fontSize: isPixelMode ? "7px" : "11px",
              letterSpacing: isPixelMode ? "0.15em" : "0.08em",
            }}
          >
            {currentTheme.name}
          </span>
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div
            className={`
              absolute top-full left-0 mt-2 w-64 overflow-hidden
              transition-all duration-300 origin-top-left
              ${isPixelMode
                ? "pixel-panel border-2"
                : "bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/60 rounded-xl shadow-2xl"
              }
            `}
          >
            {/* Header */}
            <div
              className={`
                flex items-center justify-between px-4 py-3
                ${isPixelMode ? "border-b-2 border-[var(--pixel-accent)]/20" : "border-b border-zinc-700/40"}
              `}
            >
              <span
                className="uppercase tracking-widest"
                style={{
                  fontFamily: isPixelMode ? "var(--font-pixel)" : "var(--font-inter)",
                  fontSize: isPixelMode ? "7px" : "10px",
                  color: isPixelMode ? "var(--pixel-accent)" : "#a1a1aa",
                  letterSpacing: "0.18em",
                }}
              >
                Select Theme
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label="Close theme selector"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Theme list */}
            <div className="p-2">
              {PIXEL_THEMES.map((t) => {
                const isActive = theme === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id as PixelTheme)
                      setIsOpen(false)
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200
                      ${isActive
                        ? isPixelMode
                          ? "bg-[var(--pixel-accent)]/10 border border-[var(--pixel-accent)]/30"
                          : "bg-zinc-800/80 border border-zinc-600/40 rounded-lg"
                        : isPixelMode
                          ? "hover:bg-[var(--pixel-accent)]/5 border border-transparent"
                          : "hover:bg-zinc-800/40 border border-transparent rounded-lg"
                      }
                    `}
                  >
                    {/* Color preview dots */}
                    <div className="flex items-center gap-1 shrink-0">
                      <div
                        className="w-3 h-3"
                        style={{
                          backgroundColor: t.colors[0],
                          borderRadius: isPixelMode ? 0 : "50%",
                          boxShadow: isActive ? `0 0 8px ${t.colors[0]}60` : "none",
                        }}
                      />
                      <div
                        className="w-3 h-3"
                        style={{
                          backgroundColor: t.colors[1],
                          borderRadius: isPixelMode ? 0 : "50%",
                          boxShadow: isActive ? `0 0 8px ${t.colors[1]}60` : "none",
                        }}
                      />
                    </div>

                    {/* Name + description */}
                    <div className="flex flex-col min-w-0">
                      <span
                        className="truncate"
                        style={{
                          fontFamily: isPixelMode ? "var(--font-pixel)" : "var(--font-inter)",
                          fontSize: isPixelMode ? "7px" : "12px",
                          fontWeight: isActive ? 600 : 400,
                          color: isActive
                            ? isPixelMode
                              ? "var(--pixel-accent)"
                              : "#e4e4e7"
                            : isPixelMode
                              ? "var(--pixel-text)"
                              : "#a1a1aa",
                        }}
                      >
                        {t.name}
                      </span>
                      <span
                        className="truncate"
                        style={{
                          fontFamily: isPixelMode ? "var(--font-pixel)" : "var(--font-inter)",
                          fontSize: isPixelMode ? "5px" : "10px",
                          color: isPixelMode ? "var(--pixel-text-muted)" : "#71717a",
                          lineHeight: "1.4",
                        }}
                      >
                        {t.description}
                      </span>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div
                        className="ml-auto w-1.5 h-1.5 shrink-0"
                        style={{
                          backgroundColor: isPixelMode ? "var(--pixel-accent)" : "#e4e4e7",
                          borderRadius: isPixelMode ? 0 : "50%",
                          boxShadow: isPixelMode ? "0 0 6px var(--pixel-accent)" : "none",
                        }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
