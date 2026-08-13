'use client'

import { useRef } from 'react'
import { Sparkles } from 'lucide-react'

export function Hero({
  avatarUrl,
  alias,
  tagline,
  bio,
}: {
  avatarUrl: string
  alias: string
  tagline: string
  bio: string
}) {
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startPoint = useRef({ x: 0, y: 0 })

  function cancelHold() {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    holdTimer.current = null
  }

  function openAdminAccess() {
    cancelHold()
    window.dispatchEvent(new CustomEvent('open-admin-access'))
  }

  function startHold(event: React.PointerEvent<HTMLButtonElement>) {
    startPoint.current = { x: event.clientX, y: event.clientY }
    cancelHold()
    holdTimer.current = setTimeout(openAdminAccess, 650)
  }

  function trackHold(event: React.PointerEvent<HTMLButtonElement>) {
    const dx = event.clientX - startPoint.current.x
    const dy = event.clientY - startPoint.current.y
    if (dx * dx + dy * dy > 100) cancelHold()
  }

  return (
    <section
      id="hero"
      className="flex scroll-mt-24 flex-col items-center pt-24 pb-14 text-center animate-fade-up"
    >
      <div className="relative mb-6">
        <div className="absolute -inset-1.5 rounded-full bg-foreground/25 blur-md" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl || '/placeholder.svg'}
          alt={`${alias} avatar`}
          width={128}
          height={128}
          className="relative h-32 w-32 rounded-full border border-border object-cover"
        />
      </div>

      <h1 className="text-balance font-mono text-4xl font-bold tracking-tight sm:text-5xl">
        <button
          type="button"
          className="touch-manipulation select-none rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          onPointerDown={startHold}
          onPointerMove={trackHold}
          onPointerUp={cancelHold}
          onPointerCancel={cancelHold}
          onPointerLeave={cancelHold}
          onContextMenu={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') openAdminAccess()
          }}
          aria-label={`${alias}: hold to open admin access`}
          title="Hold for admin access"
        >
          {alias}
        </button>
      </h1>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-foreground" />
        <span>{tagline}</span>
      </div>

      <p className="mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground">
        {bio}
      </p>
    </section>
  )
}
