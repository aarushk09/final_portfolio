"use client"

import { useState, useEffect } from "react"
import { SpotifyWidget } from "@/components/spotify-widget"
import { Navigation } from "@/components/navigation"
import { PhotoGallery } from "@/components/photo-gallery"
import { PixelModeToggle } from "@/components/pixel-mode-toggle"
import { usePhotoPreloader } from "@/hooks/usePhotoPreloader"

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState("portfolio")
  const [showSpotify, setShowSpotify] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null)

  // Detailed experience data
  const experienceDetails = {
    evion: {
      title: "Evion",
      role: "Co-Founder",
      period: "Jan 2025 - Present",
      description: "Building ML infrastructure for agriculture. Working with 500+ farms, trained models on 30,000+ images achieving 95% accuracy.",
      detailedDescription: "Leading the development of cutting-edge machine learning infrastructure specifically designed for agricultural applications. Our platform serves over 500 farms across multiple regions, providing real-time crop monitoring, disease detection, and yield prediction capabilities.",
      achievements: [
        "Trained computer vision models on 30,000+ agricultural images achieving 95% accuracy",
        "Deployed ML infrastructure serving 500+ farms with real-time monitoring",
        "Developed automated disease detection system reducing crop loss by 30%",
        "Built scalable data pipeline processing 10TB+ of agricultural data monthly",
        "Implemented edge computing solutions for real-time field analysis"
      ],
      technologies: ["Python", "TensorFlow", "Computer Vision", "AWS", "Edge Computing", "IoT Sensors"],
      impact: "Helping farmers increase crop yields by 25% on average while reducing pesticide usage by 40%"
    },
    dailysat: {
      title: "DailySAT",
      role: "Founder & CEO",
      period: "Aug 2024 - Present",
      description: "Transforming SAT prep through gamified learning experiences and interactive challenges.",
      detailedDescription: "Created an innovative educational platform that revolutionizes SAT preparation through gamification, personalized learning paths, and interactive challenges. The platform adapts to individual learning styles and provides comprehensive analytics for both students and educators.",
      achievements: [
        "Developed adaptive learning algorithm that personalizes study paths for each student",
        "Built gamification system with achievements, leaderboards, and progress tracking",
        "Created comprehensive question bank with 10,000+ practice problems",
        "Implemented AI-powered performance analytics and recommendations",
        "Launched mobile app with offline study capabilities"
      ],
      technologies: ["React", "Node.js", "PostgreSQL", "AI/ML", "Mobile Development", "Analytics"],
      impact: "Students using DailySAT show an average score improvement of 150+ points"
    },
    studybubbly: {
      title: "Study Bubbly",
      role: "CTO",
      period: "Sep 2024 - Present",
      description: "Platform for AP study materials. Helped 250,000+ students worldwide with curated notes and educational content.",
      detailedDescription: "Serving as Chief Technology Officer for a comprehensive educational platform that provides curated study materials, interactive content, and collaborative learning tools for AP students worldwide. The platform has become a go-to resource for high school students preparing for Advanced Placement exams.",
      achievements: [
        "Scaled platform to serve 250,000+ students across 50+ countries",
        "Developed content management system handling 1000+ study guides",
        "Built collaborative learning features enabling student study groups",
        "Implemented advanced search and recommendation algorithms",
        "Created mobile-responsive platform with 99.9% uptime"
      ],
      technologies: ["Next.js", "TypeScript", "MongoDB", "Redis", "CDN", "Mobile Optimization"],
      impact: "Over 250,000 students have accessed our materials with 85% reporting improved AP exam scores"
    },
    webgenius: {
      title: "WebGenius 501(c)(3)",
      role: "Founder",
      period: "Jul 2024 - Present",
      description: "Non-profit creating free websites for small organizations. 100+ projects completed, clients raised $300k+ in funding.",
      detailedDescription: "Founded and lead a registered 501(c)(3) non-profit organization dedicated to providing free, professional website development services to small organizations, non-profits, and community groups that lack the resources for professional web development.",
      achievements: [
        "Completed 100+ website projects for non-profits and small businesses",
        "Helped client organizations raise over $300,000 in funding",
        "Built team of 25+ volunteer developers and designers",
        "Established partnerships with major hosting providers for free services",
        "Created standardized development processes and quality assurance protocols"
      ],
      technologies: ["WordPress", "PHP", "MySQL", "JavaScript", "CSS", "Hosting Management"],
      impact: "Our client organizations have collectively raised over $300,000 in funding after receiving new websites"
    }
  }

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

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedExperience) {
        setSelectedExperience(null)
      }
    }

    if (selectedExperience) {
      window.addEventListener("keydown", handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selectedExperience])

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
                {/* Commented out for now - uncomment when needed
                <StorageSetup />
                <PhotoUpload existingPhotos={photos} />
                {photos.length > 0 && <DeleteAllPhotos photoCount={photos.length} />}
                */}
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
                      <div 
                        className="group cursor-pointer p-4 -m-4 rounded-xl hover:bg-white/5 transition-all duration-300"
                        onClick={() => setSelectedExperience('evion')}
                      >
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
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="font-inter text-sm text-zinc-500">Click to learn more →</span>
                        </div>
                      </div>

                      <div 
                        className="group cursor-pointer p-4 -m-4 rounded-xl hover:bg-white/5 transition-all duration-300"
                        onClick={() => setSelectedExperience('dailysat')}
                      >
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
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="font-inter text-sm text-zinc-500">Click to learn more →</span>
                        </div>
                      </div>

                      <div 
                        className="group cursor-pointer p-4 -m-4 rounded-xl hover:bg-white/5 transition-all duration-300"
                        onClick={() => setSelectedExperience('studybubbly')}
                      >
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
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="font-inter text-sm text-zinc-500">Click to learn more →</span>
                        </div>
                      </div>

                      <div 
                        className="group cursor-pointer p-4 -m-4 rounded-xl hover:bg-white/5 transition-all duration-300"
                        onClick={() => setSelectedExperience('webgenius')}
                      >
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
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="font-inter text-sm text-zinc-500">Click to learn more →</span>
                        </div>
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
                      className="w-[300px] h-[300px] object-cover object-bottom rounded-2xl"
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
                      <h3 className="font-inter text-sm uppercase tracking-[0.2em] text-zinc-500 mb-4">
                        Programming
                      </h3>
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
                    GASTC 8x Consecutive County & State Winner (~1k+ kids every year)
                    <br />
                    ProjectEuler+ HackerRank 32/205113
                    <br />
                    3x Regional Winners, 3x State Qualifier, State Design Winner, and World Championship Qualifier
                    <br />
                    Piano RCM Level 8 Certification, Level 8 Theory Certification
                    <br />
                    Presidential Volunteering Award Gold (300 hours)
                  </p>
                </div>
                <div>
                  <h3 className="font-inter text-xl text-white mb-4">Publications</h3>
                  <div className="space-y-4">
                    <div>
                      <a 
                        href="https://online.fliphtml5.com/pgovq/jxpw/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-crimson-text text-lg text-zinc-300 hover:text-white transition-colors"
                      >
                        Neural Network-Enhanced Inventory Forecasting for DDMRP
                      </a>
                      <p className="font-inter text-xs text-zinc-500 mt-1">
                        Submitted to NeurIPS
                      </p>
                    </div>
                    <div>
                      <p className="font-crimson-text text-lg text-zinc-400 leading-relaxed">
                        Watershed Modeling Using QSWAT to Find the Water Quality at Two Fish Hatcheries in Chattahoochee River
                      </p>
                      <p className="font-inter text-xs text-zinc-500 mt-1">
                        Oral presentation at SCWRC (Southern Climate & Water Research Conference)
                      </p>
                      <p className="font-crimson-text text-sm text-zinc-500 leading-relaxed mt-2">
                        Completed detailed literature review confirming temporal increase of ammonia causes sudden water temperature drops. 
                        Developed QSWAT hydrologic model showing manyfold increase in Nitrogen, Ammonia, and Nitrate-Nitrite loadings 
                        from subwatersheds draining to Lake Lanier. Completed SWATCUP analysis for model calibration and validation 
                        with in-situ daily data.
                      </p>
                    </div>
                  </div>
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

  // Experience Modal Component
  const ExperienceModal = () => {
    if (!selectedExperience) return null

    const experience = experienceDetails[selectedExperience as keyof typeof experienceDetails]
    if (!experience) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-md cursor-pointer animate-in fade-in duration-300"
          onClick={() => setSelectedExperience(null)}
        />
        
        {/* Modal Content */}
        <div className="relative bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-700/50 p-6 flex items-center justify-between">
            <div>
              <h2 className="font-inter text-3xl text-white mb-2">{experience.title}</h2>
              <div className="flex items-center gap-4">
                <span className="font-inter text-lg text-zinc-300">{experience.role}</span>
                <span className="font-inter text-sm text-zinc-500 uppercase tracking-wide">
                  {experience.period}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedExperience(null)}
              className="p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors text-zinc-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Overview */}
            <div>
              <h3 className="font-inter text-xl text-white mb-4">Overview</h3>
              <p className="font-crimson-text text-lg text-zinc-300 leading-relaxed">
                {experience.detailedDescription}
              </p>
            </div>

            {/* Key Achievements */}
            <div>
              <h3 className="font-inter text-xl text-white mb-4">Key Achievements</h3>
              <ul className="space-y-3">
                {experience.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full mt-3 flex-shrink-0" />
                    <p className="font-crimson-text text-lg text-zinc-300 leading-relaxed">
                      {achievement}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technologies */}
            <div>
              <h3 className="font-inter text-xl text-white mb-4">Technologies & Skills</h3>
              <div className="flex gap-2 flex-wrap">
                {experience.technologies.map((tech, index) => (
                  <span 
                    key={index}
                    className="px-3 py-2 text-sm bg-zinc-800/50 text-zinc-300 rounded-full border border-zinc-700/50"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Impact */}
            <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/30">
              <h3 className="font-inter text-xl text-white mb-3">Impact</h3>
              <p className="font-crimson-text text-lg text-zinc-300 leading-relaxed">
                {experience.impact}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
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

      <PixelModeToggle />

      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSidebarToggle={setSidebarOpen}
        showSpotifyInSidebar={activeTab === "portfolio"}
      />

      {renderContent()}
      
      {/* Experience Modal */}
      <ExperienceModal />
    </main>
  )
}
