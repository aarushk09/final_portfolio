"use client"

import { useState, useEffect } from "react"
import { SpotifyWidget } from "@/components/spotify-widget"
import { Navigation } from "@/components/navigation"
import { PhotoGallery } from "@/components/photo-gallery"
import { usePhotoPreloader } from "@/hooks/usePhotoPreloader"

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState("portfolio")
  const [showSpotify, setShowSpotify] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Detailed experience data
  const experienceDetails = {
    ung: {
      title: "University of North Georgia",
      role: "Undergraduate Research Lead",
      period: "Oct 2023 - Present",
      description: "Led a cross-functional team of 4 students on complex research initiatives, co-authored 4 papers in Environmental Science/Hydrology with applied Machine Learning.",
      detailedDescription: "Leading undergraduate research at the University of North Georgia, overseeing a team of 4 student researchers across multiple concurrent studies. Work spans Environmental Science and Hydrology domains with a focus on applying modern Machine Learning techniques to real-world water systems data.",
      achievements: [
        "Led a cross-functional team of 4 students, overseeing project timelines and data integrity across multiple concurrent studies",
        "Co-authored 4 research papers in collaboration with faculty on Environmental Science/Hydrology with applied Machine Learning",
        "Selected for Oral Presentation at SCWRC '25, delivering findings to a professional audience of 50+ attendees",
        "Presented three technical posters across AGU and SCWRC conferences",
        "Managed the end-to-end research lifecycle from hypothesis testing to publication and peer-review preparation"
      ],
      technologies: ["Python", "QSWAT", "Machine Learning", "Data Analysis", "GIS", "Hydrology Modeling"],
      impact: "Contributed 4 peer-reviewed research papers advancing Environmental Science and Hydrology applications of Machine Learning"
    },
    dailysat: {
      title: "DailySAT",
      role: "Founder",
      period: "Aug 2023 - Present",
      description: "Scaled a digital education platform to 88,000+ unique visitors and 1,000+ registered users. Engineered a viral growth strategy resulting in 6M+ organic Instagram views.",
      detailedDescription: "Founded and scaled a free SAT preparatory platform serving a global student audience. Directed a cross-functional team to build, grow, and maintain the platform — from product development and content strategy to platform reliability and viral marketing.",
      achievements: [
        "Scaled platform to 88,000+ unique visitors and 1,000+ registered users providing free SAT prep globally",
        "Directed a cross-functional team of 5 core members and 8 interns across product, content, and engineering",
        "Engineered a viral growth strategy resulting in 6M+ organic views on Instagram",
        "Architected and maintained the end-to-end technical infrastructure ensuring high availability during peak traffic",
        "Spearheaded product roadmap and feature prioritization, translating user feedback into actionable engineering tasks"
      ],
      technologies: ["Next.js", "TypeScript", "PostgreSQL", "Digital Marketing", "Analytics", "Full-Stack Development"],
      impact: "88,000+ unique visitors and 1,000+ registered users accessing free SAT preparatory resources globally"
    },
    webgenius: {
      title: "WebGenius 501(c)(3)",
      role: "Founder",
      period: "Sep 2023 - Present",
      description: "Established a registered 501(c)(3) non-profit. Directed 5 chapters and 20+ volunteers, completing 100+ web projects and securing $300K+ in corporate donations.",
      detailedDescription: "Founded and scaled a registered 501(c)(3) non-profit dedicated to providing professional web infrastructure for high school organizations globally. Oversaw all aspects of the organization from federal incorporation and board governance to project delivery and volunteer recruitment.",
      achievements: [
        "Established and scaled a registered 501(c)(3) non-profit providing professional web infrastructure for high school organizations globally",
        "Directed a national network of 5 chapters and 20+ volunteers, delivering 100+ web development projects",
        "Secured $300K+ in corporate donations and service credits, providing high-tier hosting and development tools at zero cost to students",
        "Certified and awarded 500+ community service hours to student developers",
        "Managed the full organizational lifecycle from federal non-profit incorporation to technical project management"
      ],
      technologies: ["Web Development", "Non-profit Management", "Strategic Partnerships", "Operations", "Volunteer Coordination"],
      impact: "100+ web projects delivered globally; $300K+ in secured resources benefiting student organizations at zero cost"
    },
    edpear: {
      title: "EdPear",
      role: "Founder & Maintainer",
      period: "Nov 2025 - Present",
      description: "Engineered open-source EdTech libraries achieving 4,000+ NPM installs. Secured integration interest from YC-backed startups and launched to Top 100 on Product Hunt.",
      detailedDescription: "Building and maintaining a suite of open-source EdTech libraries designed for seamless integration into enterprise-grade educational platforms. Managing the full developer ecosystem from architecture and documentation to community engagement and go-to-market strategy.",
      achievements: [
        "Engineered open-source EdTech libraries achieving 4,000+ NPM installs",
        "Secured integration interest from multiple YC-backed startups, providing technical consultations on codebase compatibility",
        "Launched to a Top 100 ranking on Product Hunt, successfully managing the initial release and community feedback loop",
        "Architected modular, high-performance components designed for enterprise-grade educational platforms",
        "Cultivated an open-source community managing documentation, pull requests, and feature requests for long-term stability"
      ],
      technologies: ["TypeScript", "NPM", "Open-Source Development", "API Design", "Developer Experience", "Go-to-Market Strategy"],
      impact: "4,000+ NPM installs with adoption interest from YC-backed startups and a Top 100 Product Hunt launch"
    },
    stealth: {
      title: "Stealth Startup (AgTech)",
      role: "Chief Technology Officer",
      period: "May 2024 - Dec 2025",
      description: "Engineered ML infrastructure for an AgTech startup with 90%+ accuracy NDVI models. Scaled to 500+ Maryland farms with models trained on 30,000+ satellite and drone images.",
      detailedDescription: "Served as CTO for a stealth AgTech startup, owning the full technical architecture and ML pipeline. Developed synthetic NDVI models and deep learning systems to enable data-driven field health monitoring at scale across hundreds of farms.",
      achievements: [
        "Engineered synthetic NDVI (Normalized Difference Vegetation Index) models achieving 90%+ accuracy across diverse crop types",
        "Scaled operations to 500+ Maryland farms, implementing data-driven tools for optimized field health monitoring",
        "Optimized deep learning models trained on 30,000+ satellite and drone images, reaching 95% peak validation accuracy",
        "Selected for a premier SF Hackerhouse residency, collaborating with elite Silicon Valley engineers and founders",
        "Architected the end-to-end data pipeline from raw image ingestion to delivering actionable vegetation indices"
      ],
      technologies: ["PyTorch", "Computer Vision", "Python", "Satellite Imagery", "NDVI Modeling", "Deep Learning"],
      impact: "ML infrastructure serving 500+ farms with 95% peak validation accuracy on a 30,000+ image proprietary dataset"
    },
    excellence: {
      title: "Excellence",
      role: "Machine Learning Intern",
      period: "May 2025 - Jul 2025",
      description: "Architected a Text-to-Video pipeline fine-tuning LLMs for math education. Increased system efficiency by 30% and reduced operational overhead by 25%.",
      detailedDescription: "Interned as a Machine Learning engineer focused on building a Text-to-Video pipeline that automates the generation of complex mathematical explanations using fine-tuned Large Language Models, bridging symbolic logic and visual animation.",
      achievements: [
        "Architected a Text-to-Video pipeline by fine-tuning LLMs to automate generation of complex mathematical explanations",
        "Increased system efficiency and output accuracy by 30% through rigorous hyperparameter tuning and custom prompt-engineering frameworks",
        "Reduced operational overhead by 25% by optimizing model inference and streamlining the video generation workflow",
        "Developed automated evaluation metrics to benchmark model performance against strict pedagogical standards",
        "Collaborated on deploying ML models to production, focusing on minimizing latency for real-time video synthesis"
      ],
      technologies: ["LLMs", "Generative AI", "Model Fine-Tuning", "NLP", "Python", "Video Synthesis"],
      impact: "30% efficiency gain and 25% reduction in operational overhead across the Text-to-Video ML pipeline"
    }
  }

  // Trigger entrance animations after first paint
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

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
            {/* Keyframe definitions */}
            <style>{`
              @keyframes slideUpFade {
                from { opacity: 0; transform: translateY(32px); }
                to   { opacity: 1; transform: translateY(0); }
              }
              @keyframes slideInRight {
                from { opacity: 0; transform: translateX(28px); }
                to   { opacity: 1; transform: translateX(0); }
              }
              @keyframes floatPhoto {
                0%, 100% { transform: translateY(0px) rotate(-0.5deg); }
                50%       { transform: translateY(-10px) rotate(0.5deg); }
              }
              @keyframes shimmer {
                0%   { background-position: -200% center; }
                100% { background-position: 200% center; }
              }
              @keyframes lineGrow {
                from { transform: scaleX(0); }
                to   { transform: scaleX(1); }
              }
              .anim-word {
                display: inline-block;
                opacity: 0;
                transform: translateY(32px);
                transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1);
              }
              .anim-word.show {
                opacity: 1;
                transform: translateY(0);
              }
              .anim-fade {
                opacity: 0;
                transform: translateY(18px);
                transition: opacity 0.7s ease, transform 0.7s ease;
              }
              .anim-fade.show {
                opacity: 1;
                transform: translateY(0);
              }
              .anim-right {
                opacity: 0;
                transform: translateX(28px);
                transition: opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1);
              }
              .anim-right.show {
                opacity: 1;
                transform: translateX(0);
              }
              .stat-line {
                transform-origin: left;
                animation: lineGrow 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
                animation-play-state: paused;
              }
              .stat-line.show {
                animation-play-state: running;
              }
              .name-shimmer {
                background: linear-gradient(90deg, #fff 0%, #fff 40%, #a1a1aa 50%, #fff 60%, #fff 100%);
                background-size: 200% auto;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              }
              .name-shimmer.show {
                animation: shimmer 2.4s linear 0.6s 1 forwards;
              }
            `}</style>

            {/* Hero */}
            <section className="px-8 pt-28 pb-14 max-w-7xl mx-auto">
              <div className="flex items-start justify-between gap-8 mb-14">
                {/* Title block */}
                <div className="flex-1">
                  <p
                    className={`font-inter text-xs uppercase tracking-[0.35em] text-zinc-600 mb-8 anim-fade${mounted ? ' show' : ''}`}
                    style={{ transitionDelay: '0ms' }}
                  >
                    based in cumming, georgia
                  </p>
                  <h1 className="font-inter leading-[0.88] tracking-tight overflow-hidden">
                    <span
                      className={`anim-word font-extralight text-[clamp(2rem,5vw,4rem)] text-zinc-400${mounted ? ' show' : ''}`}
                      style={{ transitionDelay: '80ms' }}
                    >
                      hey, i&rsquo;m
                    </span>
                    <br />
                    <span
                      className={`anim-word name-shimmer font-light text-[clamp(4rem,11vw,9.5rem)] text-white${mounted ? ' show' : ''}`}
                      style={{ transitionDelay: '180ms' }}
                    >
                      aarush
                    </span>
                  </h1>
                </div>

                {/* Photo */}
                <div
                  className={`hidden lg:block flex-shrink-0 mt-6 anim-right${mounted ? ' show' : ''}`}
                  style={{ transitionDelay: '350ms' }}
                >
                  <div
                    className="relative"
                    style={mounted ? { animation: 'floatPhoto 7s ease-in-out 1.2s infinite' } : {}}
                  >
                    <img
                      src="/images/aarush-photo.png"
                      alt="Aarush"
                      className="w-52 h-52 object-cover object-top rounded-2xl"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none" />
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Divider + bio */}
              <div
                className={`border-t border-zinc-800 pt-10 anim-fade${mounted ? ' show' : ''}`}
                style={{ transitionDelay: '420ms' }}
              >
                <p className="font-crimson-text text-xl md:text-[1.45rem] text-zinc-300 leading-[1.75] max-w-2xl">
                  I&rsquo;m a machine learning engineer and serial builder from Cumming, Georgia.
                  I train deep learning models, found companies, and ship open-source tools &mdash;
                  sometimes all at once. Over the past few years I&rsquo;ve built AgTech infrastructure
                  reaching 500+ farms, scaled an EdTech platform to 88K+ users, co-authored research
                  presented at national conferences, and put 4,000+ NPM installs worth of open-source
                  into the world. I care about work that actually ships and problems worth solving.
                </p>
              </div>
            </section>

            {/* Stats bar */}
            <section className="px-8 py-12 max-w-7xl mx-auto border-t border-zinc-800/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {([
                  { n: "88K+", label: "platform visitors", delay: 520 },
                  { n: "6M+",  label: "organic views",     delay: 600 },
                  { n: "500+", label: "farms served",      delay: 680 },
                  { n: "4K+",  label: "npm installs",      delay: 760 },
                ] as { n: string; label: string; delay: number }[]).map(({ n, label, delay }) => (
                  <div
                    key={n}
                    className={`anim-fade${mounted ? ' show' : ''}`}
                    style={{ transitionDelay: `${delay}ms` }}
                  >
                    <p className="font-inter text-[2.6rem] font-extralight text-white mb-1 tracking-tight tabular-nums">{n}</p>
                    <div
                      className={`h-px bg-zinc-700 mb-2 stat-line${mounted ? ' show' : ''}`}
                      style={{ animationDelay: `${delay + 100}ms` }}
                    />
                    <p className="font-inter text-xs uppercase tracking-[0.25em] text-zinc-600">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Selected work — editorial numbered list */}
            <section className="px-8 py-16 max-w-7xl mx-auto border-t border-zinc-800/50">
              <p
                className={`font-inter text-xs uppercase tracking-[0.35em] text-zinc-600 mb-12 anim-fade${mounted ? ' show' : ''}`}
                style={{ transitionDelay: '860ms' }}
              >
                Selected Work
              </p>
              <div>
                {([
                  { key: "ung",        name: "UNG Research",    role: "Research Lead",       year: "2023 –",  tag: "Academia"    },
                  { key: "dailysat",   name: "DailySAT",         role: "Founder",              year: "2023 –",  tag: "EdTech"      },
                  { key: "webgenius",  name: "WebGenius",        role: "Founder",              year: "2023 –",  tag: "Non-Profit"  },
                  { key: "edpear",     name: "EdPear",           role: "Founder & Maintainer", year: "2025 –",  tag: "Open Source" },
                  { key: "stealth",    name: "Stealth AgTech",   role: "CTO",                  year: "2024–25", tag: "AgTech / ML" },
                  { key: "excellence", name: "Excellence",       role: "ML Intern",            year: "2025",    tag: "LLM / GenAI" },
                ] as { key: string; name: string; role: string; year: string; tag: string }[]).map(({ key, name, role, year, tag }, i) => (
                  <div
                    key={key}
                    className={`group flex items-center justify-between py-5 border-t border-zinc-800/50 cursor-pointer hover:pl-3 transition-all duration-300 anim-fade${mounted ? ' show' : ''}`}
                    style={{ transitionDelay: `${920 + i * 70}ms` }}
                    onClick={() => setSelectedExperience(key)}
                  >
                    <div className="flex items-baseline gap-6 md:gap-10 min-w-0">
                      <span className="font-inter text-xs text-zinc-700 tabular-nums flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-inter text-xl md:text-2xl text-white group-hover:text-zinc-300 transition-colors duration-200 truncate">{name}</span>
                      <span className="hidden md:block font-inter text-sm text-zinc-600 flex-shrink-0">{role}</span>
                    </div>
                    <div className="flex items-center gap-4 md:gap-6 flex-shrink-0 ml-4">
                      <span className="hidden sm:block font-inter text-xs uppercase tracking-[0.2em] text-zinc-600 border border-zinc-800 px-2.5 py-1 rounded-full group-hover:border-zinc-600 group-hover:text-zinc-400 transition-colors duration-200">{tag}</span>
                      <span className="font-inter text-xs text-zinc-700">{year}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-zinc-400 text-sm">→</span>
                    </div>
                  </div>
                ))}
                <div className="border-t border-zinc-800/50" />
              </div>
            </section>

            {/* Recognition + About */}
            <section className="px-8 py-16 max-w-7xl mx-auto border-t border-zinc-800/50">
              <div className="grid md:grid-cols-5 gap-16">
                {/* Recognitions – wider col */}
                <div className="md:col-span-3">
                  <p className="font-inter text-xs uppercase tracking-[0.35em] text-zinc-600 mb-10">Recognition</p>
                  <ul className="space-y-4">
                    {([
                      "GASTC 8× Consecutive County & State Winner",
                      "ProjectEuler+ HackerRank — #32 of 205,113",
                      "3× Regional, 3× State Qualifier, State Design Winner, World Championship Qualifier",
                      "Piano RCM Level 8 + Level 8 Theory Certification",
                      "Presidential Volunteering Award — Gold (300 hrs)",
                    ] as string[]).map((item) => (
                      <li key={item} className="flex items-start gap-4">
                        <span className="text-zinc-700 mt-1 select-none flex-shrink-0">—</span>
                        <span className="font-crimson-text text-lg text-zinc-400 leading-snug">{item}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-4">
                      <span className="text-zinc-700 mt-1 select-none flex-shrink-0">—</span>
                      <span className="font-crimson-text text-lg text-zinc-400 leading-snug">
                        <a
                          href="https://online.fliphtml5.com/pgovq/jxpw/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-4 decoration-zinc-700 hover:text-zinc-200 transition-colors"
                        >
                          Neural Network-Enhanced Inventory Forecasting for DDMRP
                        </a>{" "}
                        — Submitted to NeurIPS
                      </span>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="text-zinc-700 mt-1 select-none flex-shrink-0">—</span>
                      <span className="font-crimson-text text-lg text-zinc-400 leading-snug">
                        Oral Presenter @ SCWRC '25 — Watershed Modeling via QSWAT
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Stack + Education + Contact */}
                <div className="md:col-span-2 space-y-10">
                  <div>
                    <p className="font-inter text-xs uppercase tracking-[0.35em] text-zinc-600 mb-5">Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {["Python", "PyTorch", "TypeScript", "Go", "SQL", "Next.js", "Computer Vision", "LLMs"].map((s) => (
                        <span key={s} className="font-inter text-xs text-zinc-500 border border-zinc-800 px-3 py-1.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-inter text-xs uppercase tracking-[0.35em] text-zinc-600 mb-5">Education</p>
                    <div className="space-y-3">
                      <div>
                        <p className="font-inter text-sm text-zinc-300">University of North Georgia</p>
                        <p className="font-inter text-xs text-zinc-700">Undergraduate — Present</p>
                      </div>
                      <div>
                        <p className="font-inter text-sm text-zinc-300">Georgia State University Perimeter</p>
                        <p className="font-inter text-xs text-zinc-700">May – Jul 2024</p>
                      </div>
                      <div>
                        <p className="font-inter text-sm text-zinc-300">South Forsyth High School</p>
                        <p className="font-inter text-xs text-zinc-700">2022</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-inter text-xs uppercase tracking-[0.35em] text-zinc-600 mb-5">Contact</p>
                    <div className="space-y-2">
                      <a href="mailto:aarushkute8@gmail.com" className="block font-inter text-sm text-zinc-500 hover:text-white transition-colors">aarushkute8@gmail.com</a>
                      <a href="https://www.linkedin.com/in/aarush-kute-1639a525b/" className="block font-inter text-sm text-zinc-500 hover:text-white transition-colors">LinkedIn ↗</a>
                      <a href="https://portfolio-v2f-two.vercel.app/" className="block font-inter text-sm text-zinc-500 hover:text-white transition-colors">Personal Website ↗</a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="px-8 py-10 max-w-7xl mx-auto border-t border-zinc-800/50">
              <p className="font-inter text-xs text-zinc-700 tracking-wide">
                © 2026 Aarush Kute — Cumming, Georgia
              </p>
            </footer>
          </>
        )
    }
  }

  // Experience Drawer Component
  const ExperienceModal = () => {
    if (!selectedExperience) return null

    const experience = experienceDetails[selectedExperience as keyof typeof experienceDetails]
    if (!experience) return null

    return (
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
          onClick={() => setSelectedExperience(null)}
        />

        {/* Slide-in drawer */}
        <div className="relative bg-zinc-950 border-l border-zinc-800 w-full max-w-xl h-full overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
          {/* Top bar */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-800/60 sticky top-0 bg-zinc-950 z-10">
            <div>
              <p className="font-inter text-xs uppercase tracking-[0.3em] text-zinc-600 mb-1">{experience.role} · {experience.period}</p>
              <h2 className="font-inter text-2xl font-light text-white">{experience.title}</h2>
            </div>
            <button
              onClick={() => setSelectedExperience(null)}
              className="text-zinc-600 hover:text-white transition-colors ml-4 flex-shrink-0"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-8 py-10 space-y-12 flex-1">
            {/* Overview */}
            <div>
              <p className="font-crimson-text text-xl text-zinc-300 leading-relaxed">
                {experience.detailedDescription}
              </p>
            </div>

            {/* Achievements */}
            <div>
              <p className="font-inter text-xs uppercase tracking-[0.3em] text-zinc-600 mb-6">Highlights</p>
              <ul className="space-y-5">
                {experience.achievements.map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="font-inter text-xs text-zinc-700 tabular-nums pt-1 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <p className="font-crimson-text text-lg text-zinc-400 leading-snug">{item}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stack */}
            <div>
              <p className="font-inter text-xs uppercase tracking-[0.3em] text-zinc-600 mb-5">Stack & Skills</p>
              <div className="flex flex-wrap gap-2">
                {experience.technologies.map((tech, i) => (
                  <span key={i} className="font-inter text-xs text-zinc-500 border border-zinc-800 px-3 py-1.5 rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Impact callout */}
            <div className="border-l-2 border-zinc-700 pl-5">
              <p className="font-inter text-xs uppercase tracking-[0.3em] text-zinc-600 mb-3">Impact</p>
              <p className="font-crimson-text text-lg text-zinc-300 leading-relaxed">{experience.impact}</p>
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