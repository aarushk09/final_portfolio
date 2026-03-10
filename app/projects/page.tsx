"use client"

import { SpotifyWidget } from "@/components/spotify-widget"
import { Navigation } from "@/components/navigation"
import { useState, useEffect } from "react"

const PROJECTS = [
  {
    title: "asdsl-framework",
    description:
      "CPU-optimized LLM inference engine for running Phi-4 (14B parameters) on Apple Silicon without a GPU. Achieves 47% RAM reduction (9.2 → 4.9 GB) via 3/4/8-bit quantization, a custom LUT matmul kernel, SWIFT speculative decoding, and block-sparse KV cache.",
    tags: ["Python", "LLM Inference", "Quantization", "Apple Silicon"],
    href: "https://github.com/aarushk09/asdsl-framework",
  },
  {
    title: "edpearOS",
    description:
      "Custom Arch Linux distribution built for academic productivity. Ships KDE Plasma and Hyprland dual desktop environments, Focus Mode (notification blocking, website filtering, blue-light filter), a Calamares-based Student Setup installer, and pre-bundled Obsidian, Zotero, VSCode, and LaTeX. ISOs are built and published automatically via GitHub Actions.",
    tags: ["Linux", "Shell", "Python", "CI/CD", "KDE Plasma"],
    href: "https://github.com/aarushk09/edpearOS",
  },
  {
    title: "EdPear SDK",
    description:
      "AI-powered educational component library offering vision AI for textbook pages, handwritten notes, and diagrams. Published as @edpear/sdk and @edpear/cli on npm with a CLI login flow, API-key management, credit tracking, and a secure proxied inference backend.",
    tags: ["TypeScript", "NPM SDK", "Vision AI", "Education"],
    href: "https://github.com/aarushk09/edpear",
  },
  {
    title: "GoFind",
    description:
      "AI-powered scavenger hunt platform inspired by Kahoot for real-world exploration. Hosts design hunt rooms with AI-generated clues; players join via 6-digit room codes, compete on live leaderboards, and share results via shareable links. Built with Next.js 15 and Supabase Realtime.",
    tags: ["Next.js", "TypeScript", "Supabase", "Real-time"],
    href: "https://github.com/aarushk09/GoFind",
  },
  {
    title: "DailySAT",
    description:
      "Free, open-source SAT prep platform scaled to 88,000+ unique visitors and 1,000+ registered users. Features Google SSO, AI-generated study plans, MongoDB + Upstash Redis caching, and a rate-limited API layer. A viral content strategy drove 6M+ organic Instagram views with zero ad spend.",
    tags: ["Next.js", "TypeScript", "MongoDB", "Redis"],
    href: "https://dailysat.org",
  },
  {
    title: "Daemo AI Agent Suite",
    description:
      "Six specialized AI agents built on the Daemo Engine SDK, each integrating a distinct external API: Gmail (smart email drafting & thread categorization), Hacker News (curated tech-news feed), Google Calendar (natural-language event scheduling with timezone parsing), Google Drive (file search, content summarization & folder organization), Google Sheets (data analysis, read/write & report generation), and Google Slides (structured-data-to-presentation builder).",
    tags: ["TypeScript", "Daemo SDK", "Google APIs", "AI Agents"],
    href: "https://github.com/aarushk09/Daemo-Bounty---Gmail-API",
  },
  {
    title: "Jenkins CI/CD Pipeline",
    description:
      "Automated CI/CD pipeline configuration and testing setup using Jenkins. Demonstrates DevOps practices including build automation, multi-stage test orchestration, artifact management, and deployment workflows.",
    tags: ["Jenkins", "CI/CD", "DevOps", "Automation"],
    href: "https://github.com/aarushk09/jenkins_ci-cd_test",
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
