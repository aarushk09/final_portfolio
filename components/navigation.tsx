"use client"

import { useState } from "react"

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    setIsOpen(false) // Close menu after selection
  }

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-8 right-8 z-50 p-3 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-full hover:bg-zinc-800/80 transition-all duration-300"
      >
        <div className="w-5 h-5 flex flex-col justify-center items-center">
          <div
            className={`w-5 h-0.5 bg-white transition-all duration-300 ${
              isOpen ? "rotate-45 translate-y-0.5" : "mb-1"
            }`}
          />
          <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${isOpen ? "opacity-0" : "mb-1"}`} />
          <div
            className={`w-5 h-0.5 bg-white transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-0.5" : ""}`}
          />
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <nav
        className={`fixed top-0 right-0 h-full w-80 bg-zinc-900/95 backdrop-blur-xl border-l border-zinc-700/50 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="pt-24 px-8">
          <div className="space-y-4">
            {[
              { id: "portfolio", label: "Portfolio", description: "About me & experience" },
              { id: "projects", label: "Projects", description: "Technical work & innovations" },
              { id: "photos", label: "Photos", description: "Personal moments & travels" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`group w-full text-left p-6 rounded-2xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-white/10 backdrop-blur-sm border border-white/20"
                    : "bg-transparent hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-inter text-xl font-medium text-white">{tab.label}</h3>
                  {activeTab === tab.id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <p className="font-crimson-text text-sm text-zinc-400">{tab.description}</p>
              </button>
            ))}
          </div>

          {/* Footer in sidebar */}
          <div className="absolute bottom-8 left-8 right-8">
            <div className="border-t border-zinc-700/50 pt-6">
              <p className="font-inter text-xs text-zinc-500 uppercase tracking-wide">Navigation</p>
              <p className="font-crimson-text text-sm text-zinc-400 mt-2">Explore different sections of my portfolio</p>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
