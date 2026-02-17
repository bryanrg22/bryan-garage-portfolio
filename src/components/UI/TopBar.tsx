import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useStore } from '../../stores/useStore'
import { useIsMobile } from '../../hooks/useIsMobile'

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/bryanrg22' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/bryanrg22/' },
  { label: 'Scholar', href: 'https://scholar.google.com/citations?user=x5W6xScAAAAJ&hl=en' },
  { label: 'DevPost', href: 'https://devpost.com/bryanrg22' },
  { label: 'Handshake', href: 'https://usc.joinhandshake.com/profiles/bryanrg22' },
  { label: 'Contact', href: 'mailto:bryanrg@usc.edu' },
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
          /* Mobile: Social dropdown + Resume pill */
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => setMobileNavOpen(!isMobileNavOpen)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                isMobileNavOpen
                  ? 'border-blue-accent bg-blue-accent/10 text-blue-accent'
                  : 'border-blue-accent/30 text-blue-accent'
              }`}
            >
              Social
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                className={`ml-1 inline-block transition-transform ${isMobileNavOpen ? 'rotate-180' : ''}`}
              >
                <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-golden/30 px-3 py-1 text-xs text-golden transition-colors hover:border-golden hover:bg-golden/10"
            >
              Resume
            </a>

            {/* Social dropdown */}
            <AnimatePresence>
              {isMobileNavOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 min-w-[180px] overflow-hidden rounded-xl border border-golden/10 bg-garage-dark/95 shadow-xl backdrop-blur-xl"
                >
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-cream transition-colors hover:bg-golden/10 hover:text-golden"
                    >
                      {link.label}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Desktop: full nav row — unchanged */
          <nav className="flex items-center gap-4">
            {socialLinks.filter(l => !l.href.startsWith('mailto:')).map((link) => (
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
    </header>
  )
}
