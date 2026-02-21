"use client"

import { usePixelMode } from "@/contexts/pixel-mode-context"
import { Monitor } from "lucide-react"

export function PixelModeToggle() {
  const { isPixelMode, togglePixelMode } = usePixelMode()

  return (
    <button
      onClick={togglePixelMode}
      aria-label={isPixelMode ? "Switch to modern mode" : "Switch to retro mode"}
      className={`
        fixed top-8 left-8 z-50 flex items-center gap-2 px-4 py-2.5
        transition-all duration-300 group
        ${
          isPixelMode
            ? "bg-[#0a0a1a] border-2 border-[#00ffd5] text-[#00ffd5] shadow-[0_0_16px_rgba(0,255,213,0.25),inset_0_0_16px_rgba(0,255,213,0.05)]"
            : "bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
        }
      `}
    >
      <Monitor
        className={`w-4 h-4 transition-all duration-300 ${
          isPixelMode ? "text-[#00ffd5] drop-shadow-[0_0_4px_rgba(0,255,213,0.6)]" : ""
        }`}
      />
      <span
        className={`text-xs font-medium uppercase tracking-wider transition-all duration-300 ${
          isPixelMode ? "font-pixel" : "font-inter"
        }`}
        style={isPixelMode ? { fontFamily: "var(--font-pixel)", fontSize: "8px", letterSpacing: "0.15em" } : {}}
      >
        {isPixelMode ? "Modern" : "Retro"}
      </span>

      {/* Toggle indicator */}
      <div
        className={`relative w-8 h-4 rounded-full transition-all duration-300 ${
          isPixelMode
            ? "bg-[#00ffd5]/20 border border-[#00ffd5]/50"
            : "bg-zinc-700 border border-zinc-600"
        }`}
        style={isPixelMode ? { borderRadius: 0 } : {}}
      >
        <div
          className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            isPixelMode
              ? "translate-x-[18px] bg-[#00ffd5] shadow-[0_0_6px_rgba(0,255,213,0.8)]"
              : "translate-x-[3px] bg-zinc-400"
          }`}
          style={isPixelMode ? { borderRadius: 0 } : {}}
        />
      </div>
    </button>
  )
}
