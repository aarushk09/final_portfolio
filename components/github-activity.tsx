"use client"

import { useState, useEffect, useRef } from "react"

const GITHUB_USERNAME = "aarushk09"

const PINNED_REPO: GitHubRepo = {
  name: "mujoco-research",
  description: "Reinforcement learning experiments and custom environments built on MuJoCo physics simulation.",
  stargazers_count: 0,
  language: "Python",
  html_url: `https://github.com/${GITHUB_USERNAME}/mujoco-research`,
  pushed_at: new Date().toISOString(),
  fork: false,
}

interface GitHubProfile {
  name: string
  bio: string | null
  avatar_url: string
  public_repos: number
  followers: number
  following: number
  html_url: string
}

interface GitHubRepo {
  name: string
  description: string | null
  stargazers_count: number
  language: string | null
  html_url: string
  pushed_at: string
  fork: boolean
}

interface ContributionDay {
  date: string
  count: number
  level: number
}

// Language colors matching GitHub
const LANG_COLORS: Record<string, string> = {
  Python: "#3572A5",
  TypeScript: "#3178C6",
  JavaScript: "#F1E05A",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Java: "#B07219",
  "C++": "#F34B7D",
  C: "#555555",
  HTML: "#E34C26",
  CSS: "#563D7C",
  Shell: "#89E051",
  Jupyter: "#DA5B0B",
  "Jupyter Notebook": "#DA5B0B",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  R: "#198CE7",
  Lua: "#000080",
  Vim: "#019833",
  Vue: "#41B883",
  Svelte: "#FF3E00",
  SCSS: "#C6538C",
  Makefile: "#427819",
  Dockerfile: "#384D54",
}

function generatePlaceholderContributions(): ContributionDay[] {
  const days: ContributionDay[] = []
  const now = new Date()
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const count = Math.random() < 0.35 ? 0 : Math.floor(Math.random() * 12)
    days.push({
      date: d.toISOString().split("T")[0],
      count,
      level: count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 9 ? 3 : 4,
    })
  }
  return days
}

export function GitHubActivity() {
  const [profile, setProfile] = useState<GitHubProfile | null>(null)
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [contributions, setContributions] = useState<ContributionDay[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Intersection observer for fade-in — must run after loading to get the real section ref
  useEffect(() => {
    if (loading) return
    const el = sectionRef.current
    if (!el) return
    // Already in view (e.g. short pages)
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight) {
      setVisible(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.05 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loading])

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=6`),
        ])

        if (profileRes.ok) setProfile(await profileRes.json())
        if (reposRes.ok) {
          const data = await reposRes.json()
          const fetched: GitHubRepo[] = data.filter((r: GitHubRepo) => !r.fork).slice(0, 6)
          const hasMujoco = fetched.some((r) => r.name.toLowerCase().includes("mujoco"))
          const merged = hasMujoco ? fetched : [...fetched, PINNED_REPO].slice(0, 6)
          setRepos(merged)
        }

        // Try third-party contributions API
        try {
          const contribRes = await fetch(
            `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`
          )
          if (contribRes.ok) {
            const data = await contribRes.json()
            setContributions(
              data.contributions.map((c: { date: string; count: number; level: number }) => ({
                date: c.date,
                count: c.count,
                level: c.level,
              }))
            )
          } else {
            setContributions(generatePlaceholderContributions())
          }
        } catch {
          setContributions(generatePlaceholderContributions())
        }
      } catch {
        setContributions(generatePlaceholderContributions())
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Build weekly grid from contribution data — full 52 weeks
  const weeks = (() => {
    if (contributions.length === 0) return []
    const recent = contributions.slice(-364)
    const result: ContributionDay[][] = []
    let week: ContributionDay[] = []
    for (const day of recent) {
      const dow = new Date(day.date).getDay()
      if (dow === 0 && week.length > 0) {
        result.push(week)
        week = []
      }
      week.push(day)
    }
    if (week.length > 0) result.push(week)
    return result
  })()

  const totalContributions = contributions.reduce((s, d) => s + d.count, 0)

  const levelColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-zinc-800/60"
      case 1:
        return "bg-emerald-900/70"
      case 2:
        return "bg-emerald-700/70"
      case 3:
        return "bg-emerald-500/70"
      case 4:
        return "bg-emerald-400/80"
      default:
        return "bg-zinc-800/60"
    }
  }

  if (loading) {
    return (
      <section className="px-8 py-16 max-w-7xl mx-auto border-t border-zinc-800/50">
        <p className="font-inter text-xs uppercase tracking-[0.35em] text-zinc-600 mb-10">
          GitHub
        </p>
        <div className="h-48 bg-zinc-900/50 rounded-2xl animate-pulse" />
      </section>
    )
  }

  return (
    <section
      ref={sectionRef}
      className="px-8 py-16 max-w-7xl mx-auto border-t border-zinc-800/50"
    >
      <style>{`
        .gh-fade {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .gh-fade.show {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <p
        className={`font-inter text-xs uppercase tracking-[0.35em] text-zinc-600 mb-8 gh-fade${visible ? " show" : ""}`}
      >
        GitHub
      </p>

      {/* Profile + Heatmap row */}
      <div className={`grid md:grid-cols-3 gap-6 mb-6 gh-fade${visible ? " show" : ""}`} style={{ transitionDelay: "80ms" }}>
        {/* Profile Card */}
        {profile && (
          <a
            href={profile.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 rounded-2xl bg-white/[0.03] border border-zinc-800/60 hover:border-zinc-700/60 hover:bg-white/[0.05] transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-5">
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-12 h-12 rounded-full ring-1 ring-zinc-800"
                />
                <div className="min-w-0">
                  <p className="font-inter text-base text-white truncate">{profile.name}</p>
                  <p className="font-inter text-xs text-zinc-600">@{GITHUB_USERNAME}</p>
                </div>
              </div>
              {profile.bio && (
                <p className="font-crimson-text text-sm text-zinc-500 leading-relaxed mb-5 line-clamp-3">
                  {profile.bio}
                </p>
              )}
            </div>
            <div className="flex gap-5 text-xs font-inter pt-4 border-t border-zinc-800/60">
              <span className="text-zinc-400">
                <span className="text-white font-medium">{profile.public_repos}</span>{" "}
                repos
              </span>
              <span className="text-zinc-400">
                <span className="text-white font-medium">{profile.followers}</span>{" "}
                followers
              </span>
              <span className="text-zinc-400">
                <span className="text-white font-medium">{profile.following}</span>{" "}
                following
              </span>
            </div>
          </a>
        )}

        {/* Full-year contribution heatmap */}
        <div
          className="md:col-span-2 p-6 rounded-2xl bg-white/[0.03] border border-zinc-800/60 flex flex-col"
        >
        <div className="flex items-center justify-between mb-4">
          <p className="font-inter text-xs text-zinc-500">
            <span className="text-white font-medium">{totalContributions.toLocaleString()}</span> contributions in the last year
          </p>
          <div className="flex items-center gap-1.5 text-[10px] font-inter text-zinc-600">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((lvl) => (
              <div
                key={lvl}
                className={`w-2.5 h-2.5 rounded-[3px] ${levelColor(lvl)}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-[3px]" style={{ minWidth: "max-content" }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={`w-[11px] h-[11px] rounded-[2px] ${levelColor(day.level)} transition-colors duration-150 hover:ring-1 hover:ring-zinc-500 cursor-default`}
                    title={`${day.date}: ${day.count} contribution${day.count !== 1 ? "s" : ""}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>

      {/* Recent Repositories */}
      {repos.length > 0 && (
        <div
          className={`grid md:grid-cols-3 gap-4 gh-fade${visible ? " show" : ""}`}
          style={{ transitionDelay: "240ms" }}
        >
          {repos.map((repo) => (
            <a
              key={repo.name}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-5 rounded-xl bg-white/[0.02] border border-zinc-800/40 hover:border-zinc-700/50 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9z" />
                </svg>
                <span className="font-inter text-sm text-zinc-300 group-hover:text-white transition-colors truncate">
                  {repo.name}
                </span>
              </div>
              {repo.description && (
                <p className="font-inter text-xs text-zinc-600 leading-relaxed line-clamp-2 mb-3">
                  {repo.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-[11px] font-inter text-zinc-600">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          LANG_COLORS[repo.language] || "#8b8b8b",
                      }}
                    />
                    {repo.language}
                  </span>
                )}
                {repo.stargazers_count > 0 && (
                  <span className="flex items-center gap-0.5">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                    </svg>
                    {repo.stargazers_count}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
