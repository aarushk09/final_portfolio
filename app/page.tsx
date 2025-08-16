"use client"

import { useState, useEffect } from "react"
import { SpotifyWidget } from "@/components/spotify-widget"
import { Navigation } from "@/components/navigation"
import { PhotoUpload } from "@/components/photo-upload"
import { PhotoGallery } from "@/components/photo-gallery"
import { DeleteAllPhotos } from "@/components/delete-all-photos"
import { StorageSetup } from "@/components/storage-setup"
import { usePhotoPreloader } from "@/hooks/usePhotoPreloader"

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState("portfolio")
  const [showSpotify, setShowSpotify] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Start preloading photos immediately
  const { photos, preloadedUrls, startPreloading } = usePhotoPreloader()

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      // Hide Spotify widget when scrolled down more than 100px
      setShowSpotify(scrollY < 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Start preloading photos as soon as the page loads
  useEffect(() => {
    // Small delay to let the page load first, then start preloading
    const timer = setTimeout(() => {
      startPreloading()
    }, 1000) // 1 second delay

    return () => clearTimeout(timer)
  }, [startPreloading])

  const renderContent = () => {
    switch (activeTab) {
      case "projects":
        return (
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
        )

      case "photos":
        return (
          <section className="px-8 py-20 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-inter text-sm uppercase tracking-[0.2em] text-zinc-500">Photos</h2>
              <div className="flex items-center gap-4">
                <StorageSetup />
                <PhotoUpload existingPhotos={photos} />
                {photos.length > 0 && <DeleteAllPhotos photoCount={photos.length} />}
              </div>
            </div>
            <PhotoGallery preloadedPhotos={photos} preloadedUrls={preloadedUrls} />
          </section>
        )

      default:
        return (
          <>
            {/* Hero Section */}
            <section className="px-8 py-20 max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-16 items-start">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-16">
                  <div className="pt-5">
                    <h1 className="font-inter font-light text-6xl md:text-8xl lg:text-9xl text-white mb-8 leading-[0.9] tracking-tight">
                      hey, i'm aarush
                    </h1>
                    <p className="font-crimson-text text-xl md:text-2xl text-zinc-300 leading-relaxed max-w-3xl">
                      I am passionate about artificial intelligence and machine learning, with a keen interest in
                      Arduino projects. In my free time, I enjoy playing the piano and tennis. My career goal is to work
                      in the AI/ML field while pursuing entrepreneurial ventures.
                    </p>
                  </div>

                  {/* Experience */}
                  <div>
                    <h2 className="font-inter text-sm uppercase tracking-[0.2em] text-zinc-500 mb-12">Experience</h2>
                    <div className="space-y-12">
                      <div className="group">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                          <h3 className="font-inter text-2xl text-white group-hover:text-zinc-200 transition-colors">
                            Evion
                          </h3>
                          <span className="font-inter text-sm text-zinc-500 uppercase tracking-wide">
                            Co-Founder • Jan 2025 - Present
                          </span>
                        </div>
                        <p className="font-crimson-text text-lg text-zinc-400 leading-relaxed">
                          Building ML infrastructure for agriculture. Working with 500+ farms, trained models on 30,000+
                          images achieving 95% accuracy.
                        </p>
                      </div>

                      <div className="group">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                          <h3 className="font-inter text-2xl text-white group-hover:text-zinc-200 transition-colors">
                            DailySAT
                          </h3>
                          <span className="font-inter text-sm text-zinc-500 uppercase tracking-wide">
                            Founder & CEO • Aug 2024 - Present
                          </span>
                        </div>
                        <p className="font-crimson-text text-lg text-zinc-400 leading-relaxed">
                          Transforming SAT prep through gamified learning experiences and interactive challenges.
                        </p>
                      </div>

                      <div className="group">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                          <h3 className="font-inter text-2xl text-white group-hover:text-zinc-200 transition-colors">
                            Study Bubbly
                          </h3>
                          <span className="font-inter text-sm text-zinc-500 uppercase tracking-wide">
                            CTO • Sep 2024 - Present
                          </span>
                        </div>
                        <p className="font-crimson-text text-lg text-zinc-400 leading-relaxed">
                          Platform for AP study materials. Helped 250,000+ students worldwide with curated notes and
                          educational content.
                        </p>
                      </div>

                      <div className="group">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                          <h3 className="font-inter text-2xl text-white group-hover:text-zinc-200 transition-colors">
                            WebGenius 501(c)(3)
                          </h3>
                          <span className="font-inter text-sm text-zinc-500 uppercase tracking-wide">
                            Founder • Jul 2024 - Present
                          </span>
                        </div>
                        <p className="font-crimson-text text-lg text-zinc-400 leading-relaxed">
                          Non-profit creating free websites for small organizations. 100+ projects completed, clients
                          raised $300k+ in funding.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Photo & Info */}
                <div className="lg:col-span-1 space-y-12">
                  <div>
                    <img
                      src="/images/aarush-photo.png"
                      alt="Aarush in Switzerland with mountains in background"
                      className="w-full aspect-square object-cover object-bottom rounded-2xl"
                    />
                  </div>

                  <div className="space-y-8">
                    {/* Education Section */}
                    <div>
                      <h3 className="font-inter text-sm uppercase tracking-[0.2em] text-zinc-500 mb-4">Education</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-inter text-lg text-white mb-1">
                            Georgia State University Perimeter College
                          </h4>
                          <p className="font-crimson-text text-base text-zinc-400">
                            Dual Enrollment, English Language and Literature
                          </p>
                          <span className="font-inter text-xs text-zinc-500 uppercase tracking-wide">
                            May 2024 - July 2024
                          </span>
                        </div>
                        <div>
                          <h4 className="font-inter text-lg text-white mb-1">South Forsyth High School</h4>
                          <span className="font-inter text-xs text-zinc-500 uppercase tracking-wide">2022</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-inter text-sm uppercase tracking-[0.2em] text-zinc-500 mb-4">Skills</h3>
                      <p className="font-crimson-text text-lg text-zinc-300 leading-relaxed">
                        Machine Learning
                        <br />
                        Arduino
                        <br />
                        Mechanical Engineering
                      </p>
                    </div>

                    <div>
                      <h3 className="font-inter text-sm uppercase tracking-[0.2em] text-zinc-500 mb-4">Programming</h3>
                      <p className="font-crimson-text text-lg text-zinc-300 leading-relaxed">
                        C#
                        <br />
                        Python
                        <br />
                        SQL
                        <br />
                        JavaScript
                      </p>
                    </div>

                    <div>
                      <h3 className="font-inter text-sm uppercase tracking-[0.2em] text-zinc-500 mb-4">Contact</h3>
                      <div className="space-y-3">
                        <a
                          href="mailto:aarushkute8@gmail.com"
                          className="block font-crimson-text text-lg text-zinc-300 hover:text-white transition-colors"
                        >
                          aarushkute8@gmail.com
                        </a>
                        <a
                          href="https://www.linkedin.com/in/aarushkute-1639a525b"
                          className="block font-crimson-text text-lg text-zinc-300 hover:text-white transition-colors"
                        >
                          LinkedIn
                        </a>
                        <a
                          href="https://portfolio-v2f-two.vercel.app/"
                          className="block font-crimson-text text-lg text-zinc-300 hover:text-white transition-colors"
                        >
                          Personal Website
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recognition Section */}
            <section className="px-8 py-20 max-w-7xl mx-auto border-t border-zinc-800/50">
              <h2 className="font-inter text-sm uppercase tracking-[0.2em] text-zinc-500 mb-12">Recognition</h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="font-inter text-xl text-white mb-4">Honors & Awards</h3>
                  <p className="font-crimson-text text-lg text-zinc-400 leading-relaxed">
                    8x Consecutive County & State Winner
                    <br />
                    HackerRank ProjectEuler+ Achievements
                    <br />
                    3x Robotics State Qualifier
                    <br />
                    Worlds Championships 2025
                    <br />
                    Piano RCM Level 8 Certification
                    <br />
                    Presidential Volunteering Award Gold (300 hours)
                  </p>
                </div>
                <div>
                  <h3 className="font-inter text-xl text-white mb-4">Publications</h3>
                  <p className="font-crimson-text text-lg text-zinc-400 leading-relaxed">
                    Neural Network-Enhanced Inventory Forecasting for DDMRP
                    <br />
                    Watershed Modeling Using QSWAT for Water Quality Analysis
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="px-8 py-12 max-w-7xl mx-auto border-t border-zinc-800/50">
              <p className="font-inter text-sm text-zinc-600">
                © 2024 Aarush. Building cool stuff from Cumming, Georgia.
              </p>
            </footer>
          </>
        )
    }
  }

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

      {/* Only show Spotify widget on portfolio tab */}
      {activeTab === "portfolio" && <SpotifyWidget isVisible={showSpotify && !sidebarOpen} />}

      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSidebarToggle={setSidebarOpen}
        showSpotifyInSidebar={activeTab === "portfolio"}
      />

      {renderContent()}
    </main>
  )
}
