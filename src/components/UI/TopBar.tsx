import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useStore } from '../../stores/useStore'
import { useIsMobile } from '../../hooks/useIsMobile'

const navLinks = [
  { label: 'GitHub', href: 'https://github.com/bryanrg22' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/bryanrg22/' },
  { label: 'Scholar', href: 'https://scholar.google.com/citations?user=x5W6xScAAAAJ&hl=en' },
  { label: 'DevPost', href: 'https://devpost.com/bryanrg22' },
  { label: 'Handshake', href: 'https://usc.joinhandshake.com/profiles/bryanrg22' },
]

export default function TopBar() {
  const setActiveItem = useStore((s) => s.setActiveItem)
  const isMobileNavOpen = useStore((s) => s.isMobileNavOpen)
  const setMobileNavOpen = useStore((s) => s.setMobileNavOpen)
  const isMobile = useIsMobile()
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!isMobileNavOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isMobileNavOpen, setMobileNavOpen])

  // Close on outside tap
  useEffect(() => {
    if (!isMobileNavOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileNavOpen(false)
      }
    }
    window.addEventListener('pointerdown', onClick)
    return () => window.removeEventListener('pointerdown', onClick)
  }, [isMobileNavOpen, setMobileNavOpen])

  return (
    <header ref={menuRef} className="pointer-events-auto fixed top-0 right-0 left-0 z-50">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <h1
          onClick={() => {
            setActiveItem(null)
            setMobileNavOpen(false)
          }}
          className="cursor-pointer font-serif text-lg tracking-wide text-golden transition-colors hover:text-cream md:text-2xl"
        >
          BRYAN'S GARAGE
        </h1>

        {isMobile ? (
          /* Mobile: Contact + Resume pills + hamburger */
          <div className="flex items-center gap-2">
            <a
              href="mailto:bryanrg@usc.edu"
              className="rounded-full border border-blue-accent/30 px-3 py-1 text-xs text-blue-accent transition-colors hover:border-blue-accent hover:bg-blue-accent/10"
            >
              Contact
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-golden/30 px-3 py-1 text-xs text-golden transition-colors hover:border-golden hover:bg-golden/10"
            >
              Resume
            </a>
            <button
              onClick={() => setMobileNavOpen(!isMobileNavOpen)}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-golden transition-colors hover:bg-golden/10"
              aria-label="Toggle menu"
            >
              <motion.div
                animate={isMobileNavOpen ? { rotate: 90 } : { rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileNavOpen ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </motion.div>
            </button>
          </div>
        ) : (
          /* Desktop: full nav row */
          <nav className="flex items-center gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-stone transition-colors hover:text-cream"
              >
                {link.label}
              </a>
            ))}
            <a
              href="mailto:bryanrg@usc.edu"
              className="rounded-full border border-blue-accent/30 px-4 py-1.5 text-sm text-blue-accent transition-colors hover:border-blue-accent hover:bg-blue-accent/10"
            >
              Contact
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-golden/30 px-4 py-1.5 text-sm text-golden transition-colors hover:border-golden hover:bg-golden/10"
            >
              Resume
            </a>
          </nav>
        )}
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {isMobile && isMobileNavOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-b border-golden/10 bg-garage-dark/95 backdrop-blur-xl"
          >
            <div className="flex flex-col px-4 py-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-3 border-l-2 border-golden/30 py-3 pl-4 text-sm text-cream transition-colors hover:border-golden hover:text-golden"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
