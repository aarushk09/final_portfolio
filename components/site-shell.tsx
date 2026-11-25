"use client"

import { useEffect, useState } from "react"
import { PhotoGallery } from "@/components/photo-gallery"
import {
  EXPERIENCE,
  LINKS,
  METRICS,
  NAV,
  PAPERS,
  PROJECTS,
  STACK,
  type Project,
  type ViewId,
} from "@/lib/portfolio-data"

function Tag({ children }: { children: string }) {
  return (
    <span className="border border-[#d9d6cf] px-2 py-0.5 text-[11px] tracking-wide text-[#3f3f3f]">
      {children}
    </span>
  )
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col bg-[#faf9f6] text-[#111] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6 border-b border-[#e4e1da] px-6 py-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#6b6b6b]">{project.category}</p>
            <h2 id="project-title" className="mt-2 font-serif text-3xl leading-tight">
              {project.title}
            </h2>
            <p className="mt-2 text-sm text-[#4a4a4a]">
              {project.role} · {project.timeframe}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-[#d9d6cf] px-3 py-1 text-xs uppercase tracking-[0.16em]"
            aria-label="Close project details"
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
          <p className="text-sm text-[#222]">{project.status}</p>
          <section>
            <h3 className="text-[11px] uppercase tracking-[0.22em] text-[#6b6b6b]">Problem / Context</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[#222]">{project.problem}</p>
          </section>
          <section>
            <h3 className="text-[11px] uppercase tracking-[0.22em] text-[#6b6b6b]">Architecture & Technical Highlights</h3>
            <ul className="mt-2 space-y-2 text-[15px] leading-relaxed text-[#222]">
              {project.architecture.map((item) => (
                <li key={item} className="border-l border-[#111] pl-3">
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="text-[11px] uppercase tracking-[0.22em] text-[#6b6b6b]">Key Outcomes</h3>
            <ul className="mt-2 space-y-2 text-[15px] leading-relaxed text-[#222]">
              {project.outcomes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>

        <div className="border-t border-[#e4e1da] bg-[#faf9f6] px-6 py-4">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center bg-[#111] px-4 py-3 text-sm tracking-wide text-[#faf9f6]"
          >
            View on GitHub ↗
          </a>
        </div>
      </div>
    </div>
  )
}

export function SiteShell({ initial = "gallery" }: { initial?: ViewId }) {
  const [view, setView] = useState<ViewId>(initial)
  const [openProject, setOpenProject] = useState<Project | null>(null)
  const [openAbstract, setOpenAbstract] = useState<number | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [view])

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-[#111]">
      <header className="sticky top-0 z-40 border-b border-[#e4e1da] bg-[#f6f4ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3 md:px-8">
          <button type="button" onClick={() => setView("gallery")} className="text-left">
            <span className="block font-serif text-xl leading-none">Aarush Kute</span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.22em] text-[#6b6b6b]">
              Computer Engineering
            </span>
          </button>
          <nav className="flex gap-1 overflow-x-auto" aria-label="Primary">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={`whitespace-nowrap px-3 py-2 text-[12px] uppercase tracking-[0.16em] ${
                  view === item.id ? "text-[#111] underline decoration-[#111] underline-offset-8" : "text-[#6b6b6b]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        {view === "gallery" && (
          <section>
            <div className="mb-8 flex items-end justify-between gap-6 border-b border-[#e4e1da] pb-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#6b6b6b]">Photographs</p>
                <h1 className="mt-2 font-serif text-4xl md:text-5xl">Gallery</h1>
              </div>
              <p className="hidden max-w-xs text-right text-sm leading-relaxed text-[#4a4a4a] md:block">
                Field notes and travel. Preview quality loads first; the original opens on click.
              </p>
            </div>
            <PhotoGallery />
          </section>
        )}

        {view === "about" && (
          <section className="space-y-14">
            <header className="max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#6b6b6b]">About</p>
              <h1 className="mt-3 font-serif text-5xl leading-[0.95] md:text-6xl">Aarush Kute</h1>
              <p className="mt-6 text-lg leading-relaxed text-[#222]">
                I build production machine-learning systems, automated data pipelines, and the software that keeps them
                running. The work sits at the intersection of computer engineering, applied ML, and tools other people
                can operate.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <a className="underline underline-offset-4" href={LINKS.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a className="underline underline-offset-4" href={LINKS.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
                <a className="underline underline-offset-4" href={LINKS.email}>
                  aarushkute8@gmail.com
                </a>
              </div>
            </header>

            <dl className="grid grid-cols-3 border-y border-[#e4e1da]">
              {METRICS.map((metric) => (
                <div key={metric.label} className="px-2 py-5 md:px-4">
                  <dt className="font-serif text-3xl md:text-4xl">{metric.value}</dt>
                  <dd className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#6b6b6b]">{metric.label}</dd>
                </div>
              ))}
            </dl>

            <section>
              <h2 className="text-[11px] uppercase tracking-[0.24em] text-[#6b6b6b]">Experience</h2>
              <ol className="mt-4 divide-y divide-[#e4e1da] border-y border-[#e4e1da]">
                {EXPERIENCE.map((job) => (
                  <li key={job.org} className="grid gap-2 py-5 md:grid-cols-[220px_1fr] md:gap-8">
                    <div>
                      <p className="font-medium">{job.org}</p>
                      <p className="text-sm text-[#4a4a4a]">{job.role}</p>
                      <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-[#6b6b6b]">{job.period}</p>
                    </div>
                    <ul className="space-y-2 text-[15px] leading-relaxed text-[#222]">
                      {job.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h2 className="text-[11px] uppercase tracking-[0.24em] text-[#6b6b6b]">Technical stack</h2>
              <div className="mt-4 grid gap-6 md:grid-cols-3">
                {STACK.map((group) => (
                  <div key={group.label} className="border-t border-[#111] pt-3">
                    <h3 className="text-sm">{group.label}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#3f3f3f]">{group.items.join(" · ")}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="text-[11px] uppercase tracking-[0.24em] text-[#6b6b6b]">Education</h2>
                <p className="mt-3 text-[15px] leading-relaxed">
                  [UPDATE: Current University — B.S. Computer Engineering, Expected 2029]
                </p>
              </div>
              <div>
                <h2 className="text-[11px] uppercase tracking-[0.24em] text-[#6b6b6b]">Technical highlight</h2>
                <p className="mt-3 text-[15px] leading-relaxed">ProjectEuler+ HackerRank — #32 of 205,113</p>
              </div>
            </section>
          </section>
        )}

        {view === "projects" && (
          <section>
            <div className="mb-8 border-b border-[#e4e1da] pb-6">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#6b6b6b]">Selected work</p>
              <h1 className="mt-2 font-serif text-4xl md:text-5xl">Projects</h1>
            </div>
            <div className="grid gap-px bg-[#e4e1da] sm:grid-cols-2">
              {PROJECTS.map((project) => (
                <button
                  key={project.title}
                  type="button"
                  onClick={() => setOpenProject(project)}
                  className="bg-[#f6f4ef] p-6 text-left transition-colors hover:bg-white"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#6b6b6b]">{project.category}</p>
                  <h2 className="mt-3 font-serif text-2xl">{project.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#333]">{project.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {view === "research" && (
          <section>
            <div className="mb-8 max-w-2xl border-b border-[#e4e1da] pb-6">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#6b6b6b]">Research</p>
              <h1 className="mt-2 font-serif text-4xl md:text-5xl">Papers & acceptances</h1>
              <p className="mt-4 text-sm leading-relaxed text-[#3f3f3f]">
                Abstracts and conference status only. HiPC India is December 2026. IST-Africa is May 2027. Manuscripts
                are not hosted here.
              </p>
            </div>
            <ol className="divide-y divide-[#e4e1da] border-y border-[#e4e1da]">
              {PAPERS.map((paper, index) => {
                const open = openAbstract === index
                return (
                  <li key={paper.title} className="py-6">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#6b6b6b]">{paper.badge}</p>
                    <h2 className="mt-2 max-w-4xl font-serif text-2xl leading-snug">{paper.title}</h2>
                    <p className="mt-2 text-sm text-[#4a4a4a]">{paper.venue}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {paper.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="mt-4 text-sm underline underline-offset-4"
                      aria-expanded={open}
                      onClick={() => setOpenAbstract(open ? null : index)}
                    >
                      {open ? "Hide abstract" : "Read abstract"}
                    </button>
                    {open && <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-[#222]">{paper.abstract}</p>}
                  </li>
                )
              })}
            </ol>
          </section>
        )}

        {view === "contact" && (
          <section className="max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#6b6b6b]">Contact</p>
            <h1 className="mt-2 font-serif text-4xl md:text-5xl">Write or follow the work.</h1>
            <ul className="mt-8 divide-y divide-[#e4e1da] border-y border-[#e4e1da] text-lg">
              <li className="py-4">
                <a href={LINKS.email}>aarushkute8@gmail.com</a>
              </li>
              <li className="py-4">
                <a href={LINKS.github} target="_blank" rel="noreferrer">
                  github.com/aarushk09
                </a>
              </li>
              <li className="py-4">
                <a href={LINKS.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </li>
            </ul>
          </section>
        )}
      </main>

      <footer className="border-t border-[#e4e1da]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-[12px] uppercase tracking-[0.16em] text-[#6b6b6b] md:flex-row md:items-center md:justify-between md:px-8">
          <p>© 2026 Aarush Kute</p>
          <p>aarushk.me</p>
        </div>
      </footer>

      {openProject && <ProjectModal project={openProject} onClose={() => setOpenProject(null)} />}
    </div>
  )
}
