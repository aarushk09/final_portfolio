export type ViewId = "gallery" | "about" | "projects" | "research" | "contact"

export const NAV: { id: ViewId; label: string }[] = [
  { id: "gallery", label: "Gallery" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "research", label: "Research" },
  { id: "contact", label: "Contact" },
]

export const LINKS = {
  github: "https://github.com/aarushk09",
  linkedin: "https://www.linkedin.com/in/aarush-kute-1639a525b/",
  email: "mailto:aarushkute8@gmail.com",
}

export const METRICS = [
  { value: "500+", label: "Farms served" },
  { value: "88K+", label: "Platform visitors" },
  { value: "4K+", label: "npm installs" },
]

export const EXPERIENCE = [
  {
    org: "DealRadar",
    role: "Founder / Builder",
    period: "2026–Present",
    points: [
      "Built automated state-registry scraping, entity resolution, and off-market M&A sourcing pipelines for lower-middle-market private equity.",
    ],
  },
  {
    org: "Excellence",
    role: "ML Intern",
    period: "2025",
    points: [
      "LLM and generative AI engineering, including a text-to-video pipeline that fine-tunes models for mathematical explanation.",
    ],
  },
  {
    org: "Stealth AgTech",
    role: "CTO",
    period: "2024–Present",
    points: [
      "Production AgTech ML and data infrastructure deployed across 500+ farms, including NDVI models trained on satellite and drone imagery.",
    ],
  },
  {
    org: "EdPear",
    role: "Founder & Maintainer",
    period: "2025–Present",
    points: [
      "Open-source educational libraries with 4K+ npm installs, covering vision AI for textbook pages, notes, and diagrams.",
    ],
  },
  {
    org: "DailySAT",
    role: "Founder",
    period: "2023–Present",
    points: [
      "SAT prep platform scaled to 88K+ visitors and 6M+ organic views, with AI study plans and a cached, rate-limited API.",
    ],
  },
  {
    org: "UNG Research",
    role: "Research Lead",
    period: "2023–Present",
    points: [
      "Applied GeoAI, environmental machine learning, and watershed modeling, including an oral presentation at SCWRC.",
    ],
  },
]

export const STACK = [
  { label: "Languages", items: ["Python", "TypeScript", "Go", "SQL"] },
  { label: "ML & Data", items: ["PyTorch", "LLMs", "Computer Vision", "GeoAI", "Data Pipelines"] },
  { label: "Systems & Web", items: ["Next.js", "Postgres", "Distributed Scraping"] },
]

export type Project = {
  title: string
  summary: string
  category: string
  role: string
  timeframe: string
  status: string
  tags: string[]
  problem: string
  architecture: string[]
  outcomes: string[]
  github: string
}

export const PROJECTS: Project[] = [
  {
    title: "asdsl-framework",
    summary: "CPU-only Phi-4 inference on Apple Silicon, with quantization and a custom matmul kernel.",
    category: "ML Systems",
    role: "Author",
    timeframe: "2025–Present",
    status: "47% RAM reduction on Phi-4 14B (9.2 → 4.9 GB)",
    tags: ["Python", "LLM Inference", "Quantization", "Apple Silicon"],
    problem:
      "Running a 14B-parameter model locally usually assumes a discrete GPU. The goal was a usable Phi-4 path on Apple Silicon CPU memory.",
    architecture: [
      "3/4/8-bit quantization to cut the resident model footprint.",
      "Custom LUT matmul kernel, SWIFT speculative decoding, and a block-sparse KV cache.",
    ],
    outcomes: [
      "Reported RAM use dropped from 9.2 GB to 4.9 GB, a 47% reduction, while keeping Phi-4 runnable without a GPU.",
    ],
    github: "https://github.com/aarushk09/asdsl-framework",
  },
  {
    title: "edpearOS",
    summary: "Academic Arch Linux image with dual desktops, focus tools, and automated ISO builds.",
    category: "Systems",
    role: "Builder",
    timeframe: "2025–Present",
    status: "ISOs published via GitHub Actions",
    tags: ["Linux", "Shell", "Python", "CI/CD"],
    problem:
      "Student machines accumulate distracting defaults. edpearOS packages a study-first Linux environment instead of a generic desktop.",
    architecture: [
      "KDE Plasma and Hyprland as dual desktop environments.",
      "Focus Mode for notification blocking, website filtering, and a blue-light filter.",
      "Calamares Student Setup installer with Obsidian, Zotero, VS Code, and LaTeX preinstalled.",
      "GitHub Actions pipeline that builds and publishes ISOs.",
    ],
    outcomes: ["Reproducible academic images that install through a student-oriented Calamares flow."],
    github: "https://github.com/aarushk09/edpearOS",
  },
  {
    title: "EdPear SDK",
    summary: "Vision AI components for textbooks, handwriting, and diagrams, published on npm.",
    category: "Open Source",
    role: "Founder & Maintainer",
    timeframe: "2025–Present",
    status: "4K+ npm installs",
    tags: ["TypeScript", "npm", "Vision AI"],
    problem:
      "Educational products need vision over messy pages and notes without each team rebuilding inference, keys, and billing.",
    architecture: [
      "Published as @edpear/sdk and @edpear/cli.",
      "CLI login, API-key management, and credit tracking.",
      "Proxied inference backend so client apps do not hold raw model credentials.",
    ],
    outcomes: ["Crossed 4K+ npm installs as a maintained open-source SDK and CLI."],
    github: "https://github.com/aarushk09/edpear",
  },
  {
    title: "GoFind",
    summary: "Live scavenger-hunt rooms with AI clues, join codes, and shareable results.",
    category: "Product",
    role: "Builder",
    timeframe: "2025",
    status: "Realtime multiplayer rooms",
    tags: ["Next.js", "TypeScript", "Supabase"],
    problem:
      "Classroom and event hunts need a host, a join code, and a live scoreboard without a custom backend for each game.",
    architecture: [
      "Next.js 15 app where hosts design rooms and AI-generated clues.",
      "Players join with 6-digit codes and compete on live leaderboards.",
      "Supabase Realtime for room state, plus shareable result links.",
    ],
    outcomes: ["A host-and-play loop that keeps scoring and room state live for the duration of a hunt."],
    github: "https://github.com/aarushk09/GoFind",
  },
  {
    title: "DailySAT",
    summary: "Free SAT prep scaled with organic distribution, study plans, and a cached API.",
    category: "EdTech",
    role: "Founder",
    timeframe: "2023–Present",
    status: "88K+ visitors · 6M+ organic views",
    tags: ["Next.js", "TypeScript", "MongoDB", "Redis"],
    problem:
      "Paid SAT tools price out students who only need structured practice and a plan.",
    architecture: [
      "Next.js product with Google SSO and AI-generated study plans.",
      "MongoDB with Upstash Redis caching and a rate-limited API layer.",
    ],
    outcomes: [
      "Scaled to 88K+ unique visitors and 1,000+ registered users.",
      "Organic distribution reached 6M+ Instagram views without ad spend.",
    ],
    github: "https://github.com/aarushk09/DailySAT",
  },
  {
    title: "Daemo AI Agent Suite",
    summary: "Six task agents on the Daemo SDK, each bound to a different external API.",
    category: "Agents",
    role: "Builder",
    timeframe: "2025",
    status: "Six production API integrations",
    tags: ["TypeScript", "Daemo SDK", "Google APIs"],
    problem:
      "General chat does not operate a mailbox, calendar, or slide deck. Each surface needs its own tool boundary.",
    architecture: [
      "Gmail agent for drafting and thread categorization.",
      "Hacker News agent for a curated technical feed.",
      "Calendar agent for natural-language scheduling with timezone parsing.",
      "Drive, Sheets, and Slides agents for search, summarization, analysis, and presentation assembly.",
    ],
    outcomes: ["One suite of six agents, each scoped to a single external API rather than a shared tool soup."],
    github: "https://github.com/aarushk09/Daemo-Bounty---Gmail-API",
  },
  {
    title: "Jenkins CI/CD Pipeline",
    summary: "Multi-stage Jenkins pipeline for build, test, artifacts, and deployment.",
    category: "DevOps",
    role: "Author",
    timeframe: "2025",
    status: "Pipeline configuration and test harness",
    tags: ["Jenkins", "CI/CD", "Automation"],
    problem: "Manual build-and-deploy steps drift. The repo captures a repeatable Jenkins path instead.",
    architecture: [
      "Declarative pipeline stages for build automation and test orchestration.",
      "Artifact handling and a deployment workflow checked into the repository.",
    ],
    outcomes: ["A versioned Jenkins setup that can be rerun instead of reconstructed from a console history."],
    github: "https://github.com/aarushk09/jenkins_ci-cd_test",
  },
]

export type Paper = {
  title: string
  venue: string
  badge: string
  tags: string[]
  abstract: string
}

export const PAPERS: Paper[] = [
  {
    title:
      "Geospatial Modeling of Sericea Lespedeza Production Suitability and Haemonchus contortus Transmission Potential: A GeoAI Decision Support Framework for Southern Africa",
    venue: "IST-Africa · May 2027",
    badge: "Accepted — IST-Africa (IEEE)",
    tags: ["GeoAI", "GIS", "Southern Africa", "3,140 paired cells"],
    abstract:
      "A geographic information system (GIS)-based multicriteria analysis was used to assess Sericea Lespedeza (SL) production suitability in Southern Africa and examine its spatial relationship with the basic reproductive quotient (Q₀) of Haemonchus contortus. Nine soil, climate, terrain and land-cover factors were reclassified on a five-point scale and combined using weighted overlay. The regional suitability map was approximately registered to the original 2007–2017 mean Q₀ raster, and 3,140 paired cells were analyzed. The Pearson correlation was −0.178 and coefficient of determination (R²) was 0.0316, indicating limited correspondence between production suitability and parasite transmission potential. The two maps therefore provide complementary information for forage supply planning and targeted parasite management. A geospatial artificial intelligence (GeoAI) and web-based GIS (WebGIS) decision support framework was formulated to combine both indicators with veterinary surveillance and invasive-species safeguards.",
  },
  {
    title:
      "GeoAI-Enabled Cancer Mortality Vulnerability Assessment: Integrating Water Quality, Air Quality, and Anthropogenic Factors in Greater Metropolitan Atlanta",
    venue: "IST-Africa · May 2027",
    badge: "Accepted — IST-Africa (IEEE)",
    tags: ["GeoAI", "Atlanta", "Random Forest", "R² 0.779"],
    abstract:
      "Geospatial artificial intelligence (GeoAI) was used to assess county-level cancer mortality in Greater Metropolitan Atlanta, Georgia, using environmental and socioeconomic data. The database contained 174 records from 29 counties across six overlapping five-year periods (2015–2019 to 2020–2024), with 23 water quality, six air quality and nine demographic variables. Multiple linear regression, support vector regression, backpropagation neural network and random forest regression were evaluated using county-grouped cross-validation and 33 predictors after redundancy screening. The separate 13-variable water quality regression explained 57.42% of the variation in observed mortality. Random forest provided the highest predictive accuracy for held-out counties (R² = 0.779; RMSE = 9.033 deaths per 100,000). County-level maps showed geographic variation in cancer mortality and particulate matter. The findings provide a basis for a proactive environmental health management decision support system.",
  },
  {
    title:
      "Integrating Expert-Driven GeoAI Modeling for Landslide Susceptibility Analysis and Historical Landslide Evidence for Agricultural Vulnerability Assessment in Idukki District, Kerala",
    venue: "HiPC India · December 2026",
    badge: "Accepted — HiPC India (IEEE)",
    tags: ["GeoAI", "Landslide", "Kerala", "1,752 records"],
    abstract:
      "Landslides threaten agricultural production, infrastructure, and rural livelihoods across the steep, monsoon-affected Western Ghats. This study develops an expert-informed geospatial and GeoAI workflow for landslide susceptibility assessment in Idukki District, Kerala, with particular attention to cropland and grassland exposure. The available evidence includes 1,752 district-clipped landslide inventory records, a five-class historical-density surface, a 2025 land-cover raster, geomorphological and terrain map illustrations, and a separately supplied predicted-susceptibility image. The historical inventory and land-cover raster are spatially overlaid to examine the distribution of cultivated land and rangeland across observed-density classes. An earlier image-space comparison of historical density and predicted susceptibility indicated weak positive association (Spearman ρ = 0.236). A Delphi/AHP-GeoAI modeling strategy and an agricultural digital-twin decision-support architecture are developed, while clearly distinguishing observed results from prospective modeling. The resulting framework supports defensible prioritization of field verification, drainage management, slope stabilization, and agricultural adaptation, pending independently validated susceptibility rasters through field visit. The study results are being validated through field visit as well as other high-resolution image-based analyses such as Google Earth imaging.",
  },
  {
    title: "Neural Network-Enhanced Inventory Forecasting for DDMRP",
    venue: "NeurIPS High School Track",
    badge: "Submitted — NeurIPS High School Track",
    tags: ["Forecasting", "DDMRP"],
    abstract:
      "Submitted work on neural inventory forecasting for demand-driven material requirements planning (DDMRP). Manuscript files are not hosted on this site.",
  },
  {
    title: "Watershed Modeling Using QSWAT: Water Quality at Two Fish Hatcheries in the Chattahoochee River",
    venue: "SCWRC",
    badge: "Oral presentation — SCWRC",
    tags: ["QSWAT", "Hydrology", "Chattahoochee"],
    abstract:
      "Oral presentation at the South Carolina Water Resources Conference. The work reviewed how rising ammonia tracks sudden drops in water temperature, then built a QSWAT hydrologic model of subwatersheds draining to Lake Lanier. The model showed large increases in nitrogen, ammonia, and nitrate-nitrite loadings, with SWAT-CUP calibration and validation against in-situ daily observations.",
  },
]
