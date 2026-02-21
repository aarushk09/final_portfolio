"use client"

import { SpotifyWidget } from "@/components/spotify-widget"
import { Navigation } from "@/components/navigation"
import { PixelModeToggle } from "@/components/pixel-mode-toggle"
import { useState, useEffect } from "react"

export default function ProjectsPage() {
  const [showSpotify, setShowSpotify] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setShowSpotify(scrollY < 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <main className="min-h-screen relative">
      {/* Subtle Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_0%,transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <SpotifyWidget isVisible={showSpotify && !sidebarOpen} />

      <PixelModeToggle />

      <Navigation
        activeTab="projects"
        onTabChange={() => {}}
        onSidebarToggle={setSidebarOpen}
        showSpotifyInSidebar={true}
      />

      {/* Projects Content */}
      <section className="px-8 py-20 max-w-7xl mx-auto">
        <h2 className="font-inter text-sm uppercase tracking-[0.2em] text-zinc-500 mb-12">Projects</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="group p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
            <h3 className="font-inter text-2xl text-white mb-4">Evion ML Platform</h3>
            <p className="font-crimson-text text-lg text-zinc-400 leading-relaxed mb-6">
              Agricultural ML infrastructure serving 500+ farms with 95% accuracy models trained on 30,000+ images.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-full">Python</span>
              <span className="px-3 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-full">TensorFlow</span>
              <span className="px-3 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-full">Computer Vision</span>
            </div>
          </div>

          <div className="group p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
            <h3 className="font-inter text-2xl text-white mb-4">DailySAT Platform</h3>
            <p className="font-crimson-text text-lg text-zinc-400 leading-relaxed mb-6">
              Gamified SAT preparation platform with interactive challenges and personalized learning paths.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-full">React</span>
              <span className="px-3 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-full">Node.js</span>
              <span className="px-3 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-full">PostgreSQL</span>
            </div>
          </div>

          <div className="group p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
            <h3 className="font-inter text-2xl text-white mb-4">Study Bubbly</h3>
            <p className="font-crimson-text text-lg text-zinc-400 leading-relaxed mb-6">
              Educational platform helping 250,000+ students worldwide with AP study materials and resources.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-full">Next.js</span>
              <span className="px-3 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-full">TypeScript</span>
              <span className="px-3 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-full">MongoDB</span>
            </div>
          </div>

          <div className="group p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
            <h3 className="font-inter text-2xl text-white mb-4">WebGenius 501(c)(3)</h3>
            <p className="font-crimson-text text-lg text-zinc-400 leading-relaxed mb-6">
              Non-profit creating free websites for organizations. 100+ projects completed, $300k+ funding raised.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-full">WordPress</span>
              <span className="px-3 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-full">PHP</span>
              <span className="px-3 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-full">MySQL</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 max-w-7xl mx-auto border-t border-zinc-800/50">
        <p className="font-inter text-sm text-zinc-600">© 2024 Aarush. Building cool stuff from Cumming, Georgia.</p>
      </footer>
    </main>
  )
}
