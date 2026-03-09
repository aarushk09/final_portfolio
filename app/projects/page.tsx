"use client"

import { SpotifyWidget } from "@/components/spotify-widget"
import { Navigation } from "@/components/navigation"
import { useState, useEffect } from "react"

const PROJECTS = [
  {
    title: "Evion ML Platform",
    description:
      "End-to-end agricultural ML infrastructure serving 500+ Maryland farms. NDVI deep learning models trained on 30,000+ satellite and drone images reach 95% peak validation accuracy.",
    tags: ["PyTorch", "Computer Vision", "Python", "Satellite Imagery"],
    href: "#",
  },
  {
    title: "DailySAT",
    description:
      "Free SAT prep platform scaled to 88,000+ unique visitors and 1,000+ registered users. A viral content strategy drove 6M+ organic Instagram views with zero ad spend.",
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
    href: "https://dailysat.vercel.app",
  },
  {
    title: "EdPear",
    description:
      "Open-source EdTech component library built for enterprise educational platforms. 4,000+ NPM installs, a Top 100 Product Hunt launch, and active integration interest from YC-backed startups.",
    tags: ["TypeScript", "NPM", "Open Source"],
    href: "https://www.npmjs.com/org/edpear",
  },
  {
    title: "WebGenius 501(c)(3)",
    description:
      "Registered non-profit providing professional web infrastructure to high school organizations globally. 5 chapters, 20+ volunteers, 100+ projects delivered, and $300K+ in secured corporate donations.",
    tags: ["Non-Profit", "Web Development", "Operations"],
    href: "#",
  },
]

export default function ProjectsPage() {
  const [showSpotify, setShowSpotify] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowSpotify(window.scrollY < 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <main className="min-h-screen relative">
      {/* Background */}
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

      <Navigation
        activeTab="projects"
        onTabChange={() => {}}
        onSidebarToggle={setSidebarOpen}
        showSpotifyInSidebar={true}
      />

      <section className="px-8 py-20 max-w-7xl mx-auto">
        <p className="font-inter text-xs uppercase tracking-[0.35em] text-zinc-600 mb-12">Projects</p>
        <div className="grid md:grid-cols-2 gap-6">
          {PROJECTS.map((project) => (
            <a
              key={project.title}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-inter text-xl text-white group-hover:text-zinc-200 transition-colors">{project.title}</h3>
                <span className="text-zinc-700 group-hover:text-zinc-400 transition-colors duration-200 text-sm ml-4 flex-shrink-0">↗</span>
              </div>
              <p className="font-crimson-text text-lg text-zinc-400 leading-relaxed flex-1 mb-6">
                {project.description}
              </p>
              <div className="flex gap-2 flex-wrap">
                {project.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 text-xs bg-zinc-800/80 text-zinc-400 rounded-full">{tag}</span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      <footer className="px-8 py-10 max-w-7xl mx-auto border-t border-zinc-800/50">
        <p className="font-inter text-xs text-zinc-700 tracking-wide">© 2026 Aarush Kute, Cumming, Georgia</p>
      </footer>
    </main>
  )
}
