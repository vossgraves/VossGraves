'use client'

import { useEffect, useState } from 'react'
import { Home, User, FolderGit2, MessageCircleQuestion } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { id: 'hero', label: 'Home', Icon: Home },
  { id: 'about', label: 'Stuff I Love', Icon: User },
  { id: 'projects', label: 'Projects', Icon: FolderGit2 },
  { id: 'ama', label: 'Ask Me', Icon: MessageCircleQuestion },
]

export function TopbarNav() {
  const [active, setActive] = useState('hero')

  useEffect(() => {
    // Determine the active section from scroll position. This is deterministic
    // in both directions (an IntersectionObserver toggling on `isIntersecting`
    // highlights the wrong pill when scrolling up).
    const LINE = 120 // px from the top — roughly under the floating nav

    const compute = () => {
      const sections = items
        .map((i) => document.getElementById(i.id))
        .filter(Boolean) as HTMLElement[]
      if (!sections.length) return

      // Snap to the last item when scrolled to the bottom of the page.
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 2
      if (scrolledToBottom) {
        setActive(sections[sections.length - 1].id)
        return
      }

      // Otherwise: the last section whose top has passed the reference line.
      let current = sections[0].id
      for (const s of sections) {
        if (s.getBoundingClientRect().top <= LINE) current = s.id
        else break
      }
      setActive(current)
    }

    compute()
    window.addEventListener('scroll', compute, { passive: true })
    window.addEventListener('resize', compute)
    return () => {
      window.removeEventListener('scroll', compute)
      window.removeEventListener('resize', compute)
    }
  }, [])

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav
        aria-label="Primary"
        className="flex items-center gap-1 rounded-full border border-border bg-card p-1.5 shadow-lg"
      >
        {items.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => go(id)}
              aria-label={label}
              aria-current={isActive ? 'true' : undefined}
              title={label}
              className={cn(
                'group relative flex h-9 items-center gap-2 rounded-full px-3 text-sm transition-colors',
                isActive
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className={cn('hidden sm:inline', !isActive && 'sm:hidden md:inline')}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    </header>
  )
}
