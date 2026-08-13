'use client'

import { useEffect, useRef } from 'react'

interface Dot {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

const POINTER_LINK_DIST = 160
const DOT_LINK_DIST = 82
const MAX_SPEED = 0.3

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let width = 0
    let height = 0
    let dots: Dot[] = []
    let raf = 0
    let visible = true
    const pointer = { x: -9999, y: -9999, active: false }
    const mobile = window.matchMedia('(pointer: coarse)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5)

    const seed = () => {
      const maxDots = mobile ? 38 : 72
      const areaPerDot = mobile ? 19000 : 18000
      const count = Math.min(maxDots, Math.max(18, Math.floor((width * height) / areaPerDot)))
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * MAX_SPEED * 2,
        vy: (Math.random() - 0.5) * MAX_SPEED * 2,
        r: 1 + Math.random(),
      }))
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.active = true
    }

    const clearPointer = () => {
      pointer.active = false
      pointer.x = -9999
      pointer.y = -9999
    }

    const tick = () => {
      if (!visible) return
      ctx.clearRect(0, 0, width, height)

      for (const dot of dots) {
        dot.x += dot.vx
        dot.y += dot.vy
        if (dot.x < -10) dot.x = width + 10
        else if (dot.x > width + 10) dot.x = -10
        if (dot.y < -10) dot.y = height + 10
        else if (dot.y > height + 10) dot.y = -10
      }

      // One path per style is much cheaper than stroking every line separately.
      ctx.beginPath()
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i]
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          if (dx * dx + dy * dy < DOT_LINK_DIST * DOT_LINK_DIST) {
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
          }
        }
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)'
      ctx.lineWidth = 1
      ctx.stroke()

      if (pointer.active) {
        ctx.beginPath()
        for (const dot of dots) {
          const dx = pointer.x - dot.x
          const dy = pointer.y - dot.y
          const distSq = dx * dx + dy * dy
          if (distSq < POINTER_LINK_DIST * POINTER_LINK_DIST) {
            ctx.moveTo(dot.x, dot.y)
            ctx.lineTo(pointer.x, pointer.y)
          }
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)'
        ctx.stroke()
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
      ctx.beginPath()
      for (const dot of dots) {
        ctx.moveTo(dot.x + dot.r, dot.y)
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2)
      }
      ctx.fill()

      raf = requestAnimationFrame(tick)
    }

    const onVisibilityChange = () => {
      visible = !document.hidden
      if (visible) {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(tick)
      }
    }

    resize()
    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerMove, { passive: true })
    window.addEventListener('pointerup', clearPointer, { passive: true })
    window.addEventListener('pointercancel', clearPointer, { passive: true })
    document.addEventListener('mouseleave', clearPointer)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerMove)
      window.removeEventListener('pointerup', clearPointer)
      window.removeEventListener('pointercancel', clearPointer)
      document.removeEventListener('mouseleave', clearPointer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  )
}
