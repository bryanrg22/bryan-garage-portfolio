import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useStore } from '../../stores/useStore'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag'
import type { ExperienceEntry, ExperienceCategory, SkillCategory, ProjectEntry, ProjectMedia, AwardEntry, HackathonEntry, EducationEntry } from '../../data/portfolio'
import { trackEvent } from '../../lib/analytics'

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

const EXPERIENCE_FILTERS: ('All' | ExperienceCategory)[] = ['All', 'Tech', 'Quant', 'Research', 'Entrepreneurship', 'Leadership']

function ExperienceContent({ entries }: { entries: ExperienceEntry[] }) {
  const [filter, setFilter] = useState<'All' | ExperienceCategory>('All')
  const visibleEntries = filter === 'All' ? entries : entries.filter((e) => e.category === filter)

  return (
    <motion.div
      variants={fadeUp}
      className="mt-6 flex flex-col gap-3"
    >
      <div className="flex flex-wrap gap-2">
        {EXPERIENCE_FILTERS.map((f) => {
          const active = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                active
                  ? 'border-golden bg-golden/15 text-golden'
                  : 'border-golden/20 text-stone hover:border-golden/50 hover:text-cream'
              }`}
            >
              {f}
            </button>
          )
        })}
      </div>
      {visibleEntries.map((entry, i) => (
        <div
          key={`${entry.company}-${i}`}
          className="rounded-lg border border-golden/10 bg-[#1a1a1a] p-4"
        >
          <div className="flex items-start gap-3">
            {entry.logo && (
              <img
                src={entry.logo}
                alt=""
                className="h-8 w-8 shrink-0 rounded object-contain" loading="lazy" decoding="async"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <div className="flex items-center gap-2">
              <p className="text-base font-bold text-golden">{entry.company}</p>
              {entry.label && (
                <span className="rounded-full bg-golden/15 px-2 py-0.5 text-[10px] font-semibold text-golden">{entry.label}</span>
              )}
            </div>
          </div>
          {entry.subRoles ? (
            <div className="mt-3 flex flex-col gap-3">
              {entry.subRoles.map((sub, j) => (
                <div key={j} className={j > 0 ? 'border-t border-golden/10 pt-3' : ''}>
                  {sub.logo || sub.company ? (
                    <div className="flex items-start gap-3">
                      {sub.logo && (
                        <img
                          src={sub.logo}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded object-contain" loading="lazy" decoding="async"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      )}
                      {sub.company && (
                        <div className="flex items-center gap-2">
                          <p className="text-base font-bold text-golden">{sub.company}</p>
                          {sub.label && (
                            <span className="rounded-full bg-golden/15 px-2 py-0.5 text-[10px] font-semibold text-golden">{sub.label}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}
                  <p className="mt-1 text-sm text-cream">{sub.role}</p>
                  <p className="mt-1 text-xs text-stone">{sub.date}</p>
                  {sub.description && (
                    <p className="mt-2 text-sm text-cream/70">{sub.description}</p>
                  )}
                  {sub.bullets && sub.bullets.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1.5 text-sm text-cream/70">
                      {sub.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-[0.35rem] h-1 w-1 shrink-0 rounded-full bg-golden/70" aria-hidden="true" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {sub.links && sub.links.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-3">
                      {sub.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-accent transition-colors hover:text-golden"
                        >
                          {link.label} ↗
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-1">
              <p className="text-sm text-cream">{entry.role}</p>
              {entry.date && <p className="mt-1 text-xs text-stone">{entry.date}</p>}
              {entry.description && (
                <p className="mt-2 text-sm text-cream/70">{entry.description}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </motion.div>
  )
}

function SkillsContent({ categories }: { categories: SkillCategory[] }) {
  return (
    <motion.div
      variants={fadeUp}
      className="mt-6 flex flex-col gap-5"
    >
      {categories.map((cat) => (
        <div key={cat.category}>
          <p className="mb-2 text-sm font-semibold text-golden/90">{cat.category}</p>
          <div className="flex flex-wrap gap-2">
            {cat.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-golden/10 bg-garage-mid px-3 py-1 text-xs text-cream/80"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  )
}

/** Single media item — video (muted autoplay) or image */
function MediaItem({ item, className }: { item: ProjectMedia; className?: string }) {
  if (item.type === 'video') {
    return (
      <video
        key={item.src}
        src={item.src}
        poster={item.poster}
        className={className}
        autoPlay
        muted
        loop
        playsInline
        controls
        preload="metadata"
      />
    )
  }
  return <img key={item.src} src={item.src} alt={item.caption} className={className} loading="lazy" decoding="async" />
}

/**
 * Desktop-only showcase: while the Projects panel is open, the selected
 * project's demo videos/screenshots fill the otherwise-empty left side of
 * the screen as a floating overlay. Rendered through a portal so it can
 * live outside the right-hand panel.
 */
function ProjectShowcase({ project, jobIndex }: { project: ProjectEntry; jobIndex: number }) {
  const [mediaIndex, setMediaIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const media = project.media!
  const current = media[Math.min(mediaIndex, media.length - 1)]
  const prev = () => setMediaIndex((i) => (i - 1 + media.length) % media.length)
  const next = () => setMediaIndex((i) => (i + 1) % media.length)

  // Which demos do visitors actually look at? Fires per project + per slide.
  useEffect(() => {
    trackEvent('project_media_viewed', {
      project: project.name,
      media_index: mediaIndex,
      media_type: media[Math.min(mediaIndex, media.length - 1)].type,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- media derives from project
  }, [project.name, mediaIndex])

  // Close the lightbox with Escape (before the panel's own Escape handler
  // closes the whole section — stopImmediatePropagation-style via capture)
  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setExpanded(false)
      }
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [expanded])

  return (
    // Wrapper centers the card in the free space left of the 420px panel,
    // clear of the Back button / logo. Card itself is frosted-glass.
    <div className="pointer-events-none fixed inset-y-0 left-0 right-0 z-40 flex items-center justify-center p-6 md:right-[420px]">
      <motion.div
        initial={{ opacity: 0, x: -40, scale: 0.97 }}
        // Delay only the ENTRANCE (so it follows the sidebar in)…
        animate={{ opacity: 1, x: 0, scale: 1, transition: { type: 'spring', damping: 26, stiffness: 240, delay: 0.45 } }}
        // …but exit immediately, in lockstep with the sidebar
        exit={{ opacity: 0, x: -40, scale: 0.97, transition: { type: 'spring', damping: 30, stiffness: 320 } }}
        className="pointer-events-auto flex w-[min(56vw,680px)] flex-col rounded-2xl border border-white/10 bg-[rgba(20,18,15,0.55)] p-4 shadow-2xl backdrop-blur-2xl"
      >
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <p className="font-serif text-lg text-golden">{project.name}</p>
          <span className="shrink-0 font-mono text-[10px] tracking-widest text-stone/70">JOB #{String(jobIndex + 1).padStart(3, '0')}</span>
        </div>

        <div className="relative flex max-h-[58vh] min-h-[240px] items-center justify-center overflow-hidden rounded-lg bg-black/30">
          <MediaItem item={current} className="max-h-[58vh] w-auto max-w-full rounded-lg object-contain" />
          {/* Expand to lightbox — native video fullscreen is blocked in some
              embedded browsers, so we roll our own overlay */}
          <button
            onClick={() => {
              trackEvent('project_media_expanded', { project: project.name, media_index: mediaIndex })
              setExpanded(true)
            }}
            aria-label="Expand media"
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-garage-dark/70 text-cream/90 backdrop-blur-sm transition-colors hover:bg-golden/20 hover:text-golden"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 1.5h4v4m0-4L7.8 6.2M5.5 12.5h-4v-4m0 4l4.7-4.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          {media.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous media"
                className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-garage-dark/70 text-cream/90 backdrop-blur-sm transition-colors hover:bg-golden/20 hover:text-golden"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button
                onClick={next}
                aria-label="Next media"
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-garage-dark/70 text-cream/90 backdrop-blur-sm transition-colors hover:bg-golden/20 hover:text-golden"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </>
          )}
        </div>

        <p className="mt-3 text-sm text-cream/80">{current.caption}</p>

        {media.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            {media.map((m, i) => (
              <button
                key={m.src}
                onClick={() => setMediaIndex(i)}
                aria-label={`Show media ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === mediaIndex ? 'w-6 bg-golden' : 'w-2 bg-stone/40 hover:bg-stone/70'}`}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Lightbox — our own "fullscreen" that works in every browser */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpanded(false)}
            className="pointer-events-auto fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/90 p-6 backdrop-blur-sm"
          >
            <button
              onClick={() => setExpanded(false)}
              aria-label="Close expanded media"
              className="absolute top-5 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-garage-mid/80 text-stone transition-colors hover:bg-cream/10 hover:text-cream"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div onClick={(e) => e.stopPropagation()} className="flex max-h-[86vh] max-w-[92vw] items-center justify-center">
              <MediaItem item={current} className="max-h-[82vh] max-w-full rounded-lg object-contain" />
            </div>
            <p className="mt-4 max-w-[80vw] text-center text-sm text-cream/85">{current.caption}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Mobile: swipeable media strip inside the project card */
function MediaStrip({ media }: { media: ProjectMedia[] }) {
  return (
    <div className="mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
      {media.map((m) => (
        <div key={m.src} className="w-56 shrink-0 snap-start overflow-hidden rounded-lg bg-black/40">
          <MediaItem item={m} className="h-40 w-full object-cover" />
          <p className="px-2 py-1.5 text-[11px] leading-tight text-cream/70">{m.caption}</p>
        </div>
      ))}
    </div>
  )
}

function ProjectsContent({ projects }: { projects: ProjectEntry[] }) {
  const isMobile = useIsMobile()
  // The showcase follows the LIVE store state (not this component's lifetime):
  // when the panel starts its exit animation this flips false immediately,
  // so the showcase leaves together with the sidebar instead of lingering.
  const projectsActive = useStore((s) => s.activeItem?.id === 'projects')
  // Desktop: the selected project's media shows in the left-side showcase.
  // Defaults to the first project that has media so the space is never empty.
  const [selectedName, setSelectedName] = useState<string | null>(
    () => projects.find((p) => p.media?.length)?.name ?? null,
  )
  const selectedIndex = projects.findIndex((p) => p.name === selectedName)
  const selected = selectedIndex >= 0 ? projects[selectedIndex] : null

  return (
    <motion.div
      variants={fadeUp}
      className="mt-6 flex flex-col gap-3"
    >
      {projects.map((project, i) => (
        <div
          key={project.name}
          onClick={project.media?.length && !isMobile ? () => setSelectedName(project.name) : undefined}
          className={`rounded-lg border bg-[#1a1a1a] p-4 transition-colors ${
            !isMobile && selectedName === project.name && project.media?.length
              ? 'border-golden/60'
              : 'border-golden/10'
          } ${project.media?.length && !isMobile ? 'cursor-pointer hover:border-golden/40' : ''}`}
        >
          <div className="flex items-start gap-3">
            {project.logo && (
              <img
                src={project.logo}
                alt=""
                className="h-8 w-8 shrink-0 rounded object-contain" loading="lazy" decoding="async"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <p className="text-base font-bold text-golden">{project.name}</p>
            {/* Auto-shop work-order tag */}
            <span className="ml-auto shrink-0 pt-0.5 font-mono text-[10px] tracking-widest text-stone/70">
              JOB #{String(i + 1).padStart(3, '0')}
            </span>
          </div>
          <p className="mt-1 text-sm text-cream/80">{project.description}</p>
          <p className="mt-2 text-xs text-golden-deep">{project.achievement}</p>
          {/* Mobile: media inline in the card */}
          {isMobile && project.media && project.media.length > 0 && <MediaStrip media={project.media} />}
          {/* Desktop: hint that this card drives the left showcase */}
          {!isMobile && project.media && project.media.length > 0 && selectedName !== project.name && (
            <p className="mt-2 text-[11px] text-blue-accent/80">▶ Click to preview demo</p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-garage-mid px-2 py-0.5 text-[10px] text-cream/70"
              >
                {tech}
              </span>
            ))}
          </div>
          {project.links && project.links.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {project.links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-accent transition-colors hover:text-golden"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Desktop: floating media showcase on the (otherwise empty) left side */}
      {!isMobile &&
        createPortal(
          <AnimatePresence>
            {projectsActive && selected?.media && selected.media.length > 0 && (
              <ProjectShowcase key={selected.name} project={selected} jobIndex={selectedIndex} />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </motion.div>
  )
}

const iconMap = { trophy: '\u{1F3C6}', medal: '\u{1F3C5}', award: '\u{1F396}\uFE0F' } as const

function AwardsContent({ awards }: { awards: AwardEntry[] }) {
  return (
    <motion.div
      variants={fadeUp}
      className="mt-6 flex flex-col gap-3"
    >
      {awards.map((award) => (
        <div
          key={award.name}
          className="rounded-lg border border-golden/10 bg-[#1a1a1a] p-4"
        >
          <div className="flex items-start gap-3">
            {award.logo && (
              <img
                src={award.logo}
                alt=""
                className="h-8 w-8 shrink-0 rounded object-contain" loading="lazy" decoding="async"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-golden">
                {iconMap[award.iconType]} {award.name}
              </p>
              <p className="mt-1 text-sm text-cream/80">{award.description}</p>
              <p className="mt-1 text-xs text-stone">{award.location} &middot; {award.year}</p>
            </div>
          </div>
          {award.photo && (
            <img
              src={award.photo}
              alt={award.name}
              className="mt-3 w-full rounded-md object-cover" loading="lazy" decoding="async"
              style={{ maxHeight: 160 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
        </div>
      ))}
    </motion.div>
  )
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  if (start === end) return fmt(s)
  return `${fmt(s)} – ${fmt(e)}`
}

function HackathonsContent({ hackathons }: { hackathons: HackathonEntry[] }) {
  return (
    <motion.div
      variants={fadeUp}
      className="mt-6 flex flex-col gap-3"
    >
      {hackathons.map((h) => (
        <div
          key={`${h.name}-${h.startDate}`}
          className="rounded-lg border border-golden/10 bg-[#1a1a1a] p-4"
        >
          <div className="flex items-start gap-3">
            {h.logo && (
              <img
                src={h.logo}
                alt=""
                className="h-8 w-8 shrink-0 rounded object-contain" loading="lazy" decoding="async"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-golden">{h.name}</p>
              <p className="mt-0.5 text-sm text-cream">{h.institution}</p>
              <p className="mt-1 text-xs text-stone">{h.location} &middot; {formatDateRange(h.startDate, h.endDate)}</p>
              {h.highlight && (
                <span className="mt-2 inline-block rounded-full bg-golden/15 px-2.5 py-0.5 text-[10px] font-semibold text-golden">
                  {h.highlight}
                </span>
              )}
              {h.status !== 'COMPLETED' && (
                <p className="mt-1 text-[11px] text-stone/70 italic">{h.status}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  )
}

function EducationContent({ entries }: { entries: EducationEntry[] }) {
  return (
    <motion.div
      variants={fadeUp}
      className="mt-6 flex flex-col gap-3"
    >
      {entries.map((entry) => (
        <div
          key={entry.school}
          className="rounded-lg border border-golden/10 bg-[#1a1a1a] p-4"
        >
          <div className="flex items-start gap-3">
            {entry.logo && (
              <img
                src={entry.logo}
                alt=""
                className="h-8 w-8 shrink-0 rounded object-contain" loading="lazy" decoding="async"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-golden">{entry.school}</p>
              <p className="mt-1 text-sm text-cream">{entry.degree}</p>
              <p className="mt-1 text-xs text-stone">{entry.dates}</p>
            </div>
          </div>
          {entry.details.length > 0 && (
            <div className="mt-3 flex flex-col gap-1">
              {entry.details.map((detail) => (
                <p key={detail} className="text-sm text-cream/70">{detail}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </motion.div>
  )
}

/** Shared panel content — used by both desktop and mobile layouts */
function PanelContent({ activeItem }: { activeItem: NonNullable<ReturnType<typeof useStore.getState>['activeItem']> }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
      }}
      className={activeItem.id === 'boombox' ? 'flex flex-1 min-h-0 flex-col' : undefined}
    >
      <motion.h2
        variants={fadeUp}
        className="font-serif text-3xl text-golden"
      >
        {activeItem.title}
      </motion.h2>

      <motion.p
        variants={fadeUp}
        className="mt-2 text-sm text-stone"
      >
        {activeItem.subtitle}
      </motion.p>

      <motion.div
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        className="mt-6 h-px bg-golden/20"
      />

      {activeItem.experienceEntries ? (
        <ExperienceContent entries={activeItem.experienceEntries} />
      ) : activeItem.skillCategories ? (
        <SkillsContent categories={activeItem.skillCategories} />
      ) : activeItem.projectEntries ? (
        <ProjectsContent projects={activeItem.projectEntries} />
      ) : activeItem.awardEntries ? (
        <AwardsContent awards={activeItem.awardEntries} />
      ) : activeItem.hackathonEntries ? (
        <HackathonsContent hackathons={activeItem.hackathonEntries} />
      ) : activeItem.educationEntries ? (
        <EducationContent entries={activeItem.educationEntries} />
      ) : activeItem.id === 'boombox' ? (
        <motion.div variants={fadeUp} className="mt-6 flex-1 min-h-0" />
      ) : (
        <motion.div
          variants={fadeUp}
          className="mt-6 leading-relaxed text-cream/80"
        >
          {activeItem.description.split('\n').map((line, i) => (
            line === '' ? <br key={i} /> : <p key={i}>{line}</p>
          ))}
        </motion.div>
      )}

      {activeItem.gallery && activeItem.gallery.length > 0 && (
        <motion.div
          variants={fadeUp}
          className="mt-6 flex flex-col gap-3"
        >
          {activeItem.gallery.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              className="w-full rounded-lg" loading="lazy" decoding="async"
              style={{ maxHeight: src.includes('me_working') ? 450 : 320, objectFit: src.includes('me_working') ? 'contain' : 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ))}
        </motion.div>
      )}

      {activeItem.id !== 'boombox' && activeItem.tags && activeItem.tags.length > 0 && (
        <motion.div
          variants={fadeUp}
          className="mt-6 flex flex-wrap gap-2"
        >
          {activeItem.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-golden/20 px-3 py-1 text-xs text-golden/80"
            >
              {tag}
            </span>
          ))}
        </motion.div>
      )}

      {activeItem.id !== 'boombox' && activeItem.links && activeItem.links.length > 0 && (
        <motion.div
          variants={fadeUp}
          className="mt-8 flex flex-col gap-3"
        >
          {activeItem.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-accent transition-colors hover:text-golden"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V9m-5 0L12 2m0 0H9m3 0v3"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {link.label}
            </a>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

const CAMERA_FLY_DURATION = 1250 // ms — matches the 1.2s GSAP camera animation + small buffer

function MobileBottomSheet() {
  const activeItem = useStore((s) => s.activeItem)
  const setActiveItem = useStore((s) => s.setActiveItem)
  const [sheet, setSheet] = useState<{ item: typeof activeItem; visible: boolean }>({ item: null, visible: false })
  const showSheet = sheet.visible
  const sheetItem = sheet.item

  // Adjust-during-render (sanctioned derived-state pattern):
  // dismiss (activeItem → null) hides immediately; switching sections while
  // the sheet is open swaps content immediately.
  if (activeItem === null) {
    if (sheet.item !== null || sheet.visible) setSheet({ item: null, visible: false })
  } else if (sheet.visible && sheet.item && sheet.item.id !== activeItem.id) {
    setSheet({ item: activeItem, visible: true })
  }

  // Opening from a closed state waits for the camera fly-in (async setState only)
  useEffect(() => {
    if (!activeItem || showSheet) return
    const timer = setTimeout(() => {
      setSheet({ item: activeItem, visible: true })
    }, CAMERA_FLY_DURATION)
    return () => clearTimeout(timer)
  }, [activeItem, showSheet])

  const dismiss = useCallback(() => {
    setActiveItem(null)
  }, [setActiveItem])

  const setBottomSheetExpanded = useStore((s) => s.setBottomSheetExpanded)

  const { translateY, isDragging, snapState, heightVh, handleProps, reset } = useBottomSheetDrag({
    onDismiss: dismiss,
  })

  // Sync expanded state to the store so SpotifyPlayer can match the sheet height
  useEffect(() => {
    setBottomSheetExpanded(snapState === 'full')
  }, [snapState, setBottomSheetExpanded])

  // Reset drag state when sheet item changes
  useEffect(() => {
    reset()
  }, [sheetItem, reset])

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveItem(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setActiveItem])

  return (
    <AnimatePresence>
      {showSheet && sheetItem && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={dismiss}
            className="pointer-events-auto fixed inset-0 z-[44] bg-black/30"
          />

          {/* Bottom sheet */}
          <motion.aside
            key={sheetItem.id}
            initial={{ y: '100%' }}
            animate={{ y: 0, height: `${heightVh}vh` }}
            exit={{ y: '100%' }}
            transition={isDragging ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 300 }}
            style={isDragging ? { transform: `translateY(${translateY}px)`, height: `${heightVh}vh` } : undefined}
            className={`pointer-events-auto fixed bottom-0 left-0 right-0 z-[45] flex flex-col rounded-t-2xl border-t border-golden/10 bg-[rgba(20,18,15,0.97)] backdrop-blur-xl ${sheetItem.id === 'boombox' ? 'overflow-hidden' : 'overflow-y-auto'}`}
          >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Drag handle */}
              <div
                {...handleProps}
                className="flex shrink-0 cursor-grab touch-none items-center justify-center py-3 active:cursor-grabbing"
              >
                <div className="h-1 w-10 rounded-full bg-stone/40" />
              </div>

              {/* Close button — pinned below drag handle, high z-index to avoid nav conflict */}
              <div className="flex shrink-0 justify-end px-4">
                <button
                  onClick={dismiss}
                  className="z-[60] flex h-8 w-8 items-center justify-center rounded-full bg-garage-mid/80 text-stone transition-colors hover:bg-cream/10 hover:text-cream"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Scrollable content */}
              <div className={`flex-1 px-6 pb-36 ${sheetItem.id === 'boombox' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'}`}>
                <PanelContent activeItem={sheetItem} />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function DesktopPanel() {
  const activeItem = useStore((s) => s.activeItem)
  const setActiveItem = useStore((s) => s.setActiveItem)
  const [panel, setPanel] = useState<{ item: typeof activeItem; visible: boolean }>({ item: null, visible: false })

  // Adjust-during-render (same pattern as the mobile sheet): dismissing hides
  // immediately; switching sections while open swaps content immediately.
  if (activeItem === null) {
    if (panel.item !== null || panel.visible) setPanel({ item: null, visible: false })
  } else if (panel.visible && panel.item && panel.item.id !== activeItem.id) {
    setPanel({ item: activeItem, visible: true })
  }

  // Opening from a closed state waits for the camera fly-in, so the visitor
  // watches the zoom before the sidebar slides over it.
  useEffect(() => {
    if (!activeItem || panel.visible) return
    const timer = setTimeout(() => {
      setPanel({ item: activeItem, visible: true })
    }, CAMERA_FLY_DURATION)
    return () => clearTimeout(timer)
  }, [activeItem, panel.visible])

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveItem(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setActiveItem])

  return (
    <AnimatePresence>
      {panel.visible && panel.item && (
        <motion.aside
          key={panel.item.id}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className={`pointer-events-auto fixed top-0 right-0 z-40 flex h-full w-full flex-col border-l border-golden/10 bg-[rgba(20,18,15,0.92)] p-8 pt-20 pb-28 backdrop-blur-xl md:w-[420px] ${panel.item.id === 'boombox' ? 'overflow-hidden' : 'overflow-y-auto'}`}
        >
          {/* Close button */}
          <button
            onClick={() => setActiveItem(null)}
            className="absolute top-16 right-5 flex h-8 w-8 items-center justify-center rounded-full text-stone transition-colors hover:bg-cream/10 hover:text-cream"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <PanelContent activeItem={panel.item} />
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

export default function InfoPanel() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MobileBottomSheet />
  }

  return <DesktopPanel />
}
