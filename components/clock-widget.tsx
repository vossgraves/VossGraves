'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

const OWNER_TZ = 'Asia/Kolkata'
const OWNER_LABEL = 'GMT+5:30'

function format(date: Date, timeZone?: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...(timeZone ? { timeZone } : {}),
  }).format(date)
}

const subscribe = () => () => {}
const getSameTimezone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone === OWNER_TZ
const getServerTimezone = () => false

export function ClockWidget() {
  const [local, setLocal] = useState('--:--')
  const [yours, setYours] = useState('--:--')
  const sameTz = useSyncExternalStore(subscribe, getSameTimezone, getServerTimezone)
  const clicks = useRef<number[]>([])

  function registerClick() {
    const now = Date.now()
    // keep only clicks within the last 900ms
    clicks.current = [...clicks.current, now].filter((t) => now - t < 900)
    if (clicks.current.length >= 3) {
      clicks.current = []
      window.dispatchEvent(new CustomEvent('open-private-access'))
    }
  }

  useEffect(() => {
    function tick() {
      const now = new Date()
      setLocal(format(now, OWNER_TZ))
      setYours(format(now))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-foreground" />
          Time Link
        </div>
        <button
          type="button"
          onClick={registerClick}
          aria-label="12 hour clock"
          className="touch-manipulation select-none rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          12H
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-mono text-2xl font-semibold tabular-nums text-foreground">
            {local}
          </div>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">{OWNER_LABEL}</div>
        </div>
        <div className="h-10 w-px bg-border" />
        <div className="text-right">
          <div className="font-mono text-2xl font-semibold tabular-nums text-foreground">
            {yours}
          </div>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">Your Time</div>
        </div>
      </div>

      <div className="mt-4 h-px w-full bg-border" />
      <div className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
        {sameTz ? 'Same timezone' : 'Different timezones'}
      </div>
    </div>
  )
}
