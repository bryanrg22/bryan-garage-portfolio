import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useStore } from '../../stores/useStore'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag'
import type { ExperienceEntry, SkillCategory, ProjectEntry, AwardEntry, HackathonEntry, EducationEntry } from '../../data/portfolio'

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

function ExperienceContent({ entries }: { entries: ExperienceEntry[] }) {
  return (
    <motion.div
      variants={fadeUp}
      className="mt-6 flex flex-col gap-3"
    >
      {entries.map((entry, i) => (
        <div
          key={`${entry.company}-${i}`}
          className="rounded-lg border border-golden/10 bg-[#1a1a1a] p-4"
        >
          <div className="flex items-start gap-3">
            {entry.logo && (
              <img
                src={entry.logo}
                alt=""
                className="h-8 w-8 shrink-0 rounded object-contain"
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
                          className="h-8 w-8 shrink-0 rounded object-contain"
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

function ProjectsContent({ projects }: { projects: ProjectEntry[] }) {
  return (
    <motion.div
      variants={fadeUp}
      className="mt-6 flex flex-col gap-3"
    >
      {projects.map((project) => (
        <div
          key={project.name}
          className="rounded-lg border border-golden/10 bg-[#1a1a1a] p-4"
        >
          <div className="flex items-start gap-3">
            {project.logo && (
              <img
                src={project.logo}
                alt=""
                className="h-8 w-8 shrink-0 rounded object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <p className="text-base font-bold text-golden">{project.name}</p>
          </div>
          <p className="mt-1 text-sm text-cream/80">{project.description}</p>
          <p className="mt-2 text-xs text-golden-deep">{project.achievement}</p>
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
                className="h-8 w-8 shrink-0 rounded object-contain"
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
              className="mt-3 w-full rounded-md object-cover"
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
                className="h-8 w-8 shrink-0 rounded object-contain"
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
                className="h-8 w-8 shrink-0 rounded object-contain"
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
              className="w-full rounded-lg"
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
  const [showSheet, setShowSheet] = useState(false)
  const [sheetItem, setSheetItem] = useState(activeItem)

  // Delay the sheet appearance so the user can watch the camera fly-in first.
  // On dismiss (activeItem → null): hide immediately.
  // On switch (itemA → itemB while sheet is open): update content immediately.
  useEffect(() => {
    if (activeItem === null) {
      // Dismissing — hide immediately
      setShowSheet(false)
      setSheetItem(null)
      return
    }

    if (showSheet && sheetItem) {
      // Sheet already open, switching sections — update content immediately
      setSheetItem(activeItem)
      return
    }

    // New item from closed state — wait for camera animation
    const timer = setTimeout(() => {
      setSheetItem(activeItem)
      setShowSheet(true)
    }, CAMERA_FLY_DURATION)
    return () => clearTimeout(timer)
  }, [activeItem]) // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = useCallback(() => {
    setActiveItem(null)
  }, [setActiveItem])

  const { translateY, isDragging, isExpanded, handleProps, reset } = useBottomSheetDrag({
    onDismiss: dismiss,
  })

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
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={isDragging ? { duration: 0 } : { type: 'spring', damping: 28, stiffness: 260 }}
            style={isDragging ? { transform: `translateY(${Math.max(0, translateY)}px)` } : undefined}
            className={`pointer-events-auto fixed bottom-0 left-0 right-0 z-[45] flex flex-col rounded-t-2xl border-t border-golden/10 bg-[rgba(20,18,15,0.97)] backdrop-blur-xl ${sheetItem.id === 'boombox' ? 'overflow-hidden' : 'overflow-y-auto'}`}
          >
            <div style={{ height: isExpanded ? '92vh' : '70vh', display: 'flex', flexDirection: 'column' }}>
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
              <div className={`flex-1 px-6 pb-24 ${sheetItem.id === 'boombox' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'}`}>
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
      {activeItem && (
        <motion.aside
          key={activeItem.id}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className={`pointer-events-auto fixed top-0 right-0 z-40 flex h-full w-full flex-col border-l border-golden/10 bg-[rgba(20,18,15,0.92)] p-8 pt-20 backdrop-blur-xl md:w-[420px] ${activeItem.id === 'boombox' ? 'overflow-hidden' : 'overflow-y-auto'}`}
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

          <PanelContent activeItem={activeItem} />
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
