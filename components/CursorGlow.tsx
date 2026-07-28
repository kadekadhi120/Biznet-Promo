'use client'

import { useCallback, useEffect, useRef } from 'react'

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: -200, y: -200 })
  const posRef = useRef({ x: -200, y: -200 })
  const rafRef = useRef<number>(0)

  const animate = useCallback(() => {
    const glow = glowRef.current
    if (!glow) return
    const mx = mouseRef.current.x
    const my = mouseRef.current.y
    const px = posRef.current.x
    const py = posRef.current.y
    posRef.current.x += (mx - px) * 0.15
    posRef.current.y += (my - py) * 0.15
    glow.style.transform = `translate(${posRef.current.x - 300}px, ${posRef.current.y - 300}px)`
    rafRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handle, { passive: true })
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener('mousemove', handle)
      cancelAnimationFrame(rafRef.current)
    }
  }, [animate])

  return (
    <div
      className="fixed pointer-events-none z-[9999] inset-0 hidden md:block"
      aria-hidden="true"
    >
      <div
        ref={glowRef}
        className="absolute top-0 left-0 will-change-transform"
        style={{
          width: 600,
          height: 600,
          background:
            'radial-gradient(circle, rgba(14,165,233,0.12) 0%, rgba(14,165,233,0.04) 40%, transparent 70%)',
        }}
      />
    </div>
  )
}
