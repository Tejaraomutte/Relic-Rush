import React, { useEffect, useRef } from 'react'

/*
  ✨ CursorTrail — Mystical gold particle trail that follows the cursor.
  Renders on a fixed canvas overlay. Uses requestAnimationFrame for smooth 60fps.
*/

const PARTICLE_COUNT = 22
const TRAIL_LENGTH = 12

export default function CursorTrail() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')

        let w = window.innerWidth
        let h = window.innerHeight
        canvas.width = w
        canvas.height = h

        let mouseX = w / 2
        let mouseY = h / 2
        let animId = null

        /* ── Cursor dot (main glow) ── */
        const cursor = { x: w / 2, y: h / 2 }
        const EASE = 0.15

        /* ── Trail dots ── */
        const trail = Array.from({ length: TRAIL_LENGTH }, () => ({ x: w / 2, y: h / 2 }))

        /* ── Sparkle particles ── */
        const particles = []

        function spawnParticle(x, y) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 2.5,
                vy: (Math.random() - 0.5) * 2.5,
                life: 1,
                decay: 0.015 + Math.random() * 0.025,
                size: 1.5 + Math.random() * 3,
                hue: 40 + Math.random() * 20, // gold range
            })
        }

        /* ── Handlers ── */
        const onMove = (e) => {
            mouseX = e.clientX
            mouseY = e.clientY
        }
        const onResize = () => {
            w = window.innerWidth
            h = window.innerHeight
            canvas.width = w
            canvas.height = h
        }

        window.addEventListener('mousemove', onMove, { passive: true })
        window.addEventListener('resize', onResize, { passive: true })

        let frame = 0

        function draw() {
            ctx.clearRect(0, 0, w, h)

            /* ── Update cursor position (smooth ease) ── */
            cursor.x += (mouseX - cursor.x) * EASE
            cursor.y += (mouseY - cursor.y) * EASE

            /* ── Update trail ── */
            trail[0].x += (cursor.x - trail[0].x) * 0.35
            trail[0].y += (cursor.y - trail[0].y) * 0.35
            for (let i = 1; i < trail.length; i++) {
                trail[i].x += (trail[i - 1].x - trail[i].x) * 0.3
                trail[i].y += (trail[i - 1].y - trail[i].y) * 0.3
            }

            /* ── Spawn particles every few frames ── */
            frame++
            if (frame % 2 === 0 && particles.length < PARTICLE_COUNT) {
                spawnParticle(cursor.x, cursor.y)
            }

            /* ── Draw trail line ── */
            if (trail.length > 1) {
                ctx.beginPath()
                ctx.moveTo(trail[0].x, trail[0].y)
                for (let i = 1; i < trail.length; i++) {
                    const xc = (trail[i].x + trail[i - 1].x) / 2
                    const yc = (trail[i].y + trail[i - 1].y) / 2
                    ctx.quadraticCurveTo(trail[i - 1].x, trail[i - 1].y, xc, yc)
                }
                ctx.strokeStyle = 'rgba(255, 215, 0, 0.12)'
                ctx.lineWidth = 2
                ctx.stroke()
            }

            /* ── Draw trail dots (fading) ── */
            for (let i = 0; i < trail.length; i++) {
                const t = 1 - i / trail.length
                const radius = 3 * t + 1
                const alpha = 0.35 * t

                ctx.beginPath()
                ctx.arc(trail[i].x, trail[i].y, radius, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`
                ctx.fill()
            }

            /* ── Draw sparkle particles ── */
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i]
                p.x += p.vx
                p.y += p.vy
                p.vy += 0.02 // slight gravity
                p.life -= p.decay

                if (p.life <= 0) {
                    particles.splice(i, 1)
                    continue
                }

                const alpha = p.life * 0.7
                const size = p.size * p.life

                // Glow
                ctx.beginPath()
                ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2)
                const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2)
                glow.addColorStop(0, `hsla(${p.hue}, 100%, 65%, ${alpha * 0.3})`)
                glow.addColorStop(1, `hsla(${p.hue}, 100%, 65%, 0)`)
                ctx.fillStyle = glow
                ctx.fill()

                // Core dot
                ctx.beginPath()
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
                ctx.fillStyle = `hsla(${p.hue}, 100%, 75%, ${alpha})`
                ctx.fill()
            }

            /* ── Main cursor glow ── */
            const cGlow = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, 28)
            cGlow.addColorStop(0, 'rgba(255, 215, 0, 0.18)')
            cGlow.addColorStop(0.5, 'rgba(0, 217, 255, 0.06)')
            cGlow.addColorStop(1, 'rgba(255, 215, 0, 0)')
            ctx.beginPath()
            ctx.arc(cursor.x, cursor.y, 28, 0, Math.PI * 2)
            ctx.fillStyle = cGlow
            ctx.fill()

            // Inner dot
            ctx.beginPath()
            ctx.arc(cursor.x, cursor.y, 4, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(255, 215, 0, 0.8)'
            ctx.fill()

            animId = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('resize', onResize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                pointerEvents: 'none',
            }}
        />
    )
}
