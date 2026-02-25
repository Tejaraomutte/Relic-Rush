import React, { useEffect, useState, useRef } from 'react'
import lamp from '../assets/images/lamp.jpeg'
import '../styles/LampDisplay.css'

export default function LampDisplay({ lampsRemaining = 4, showMessage = false }) {
  const [displayLamps, setDisplayLamps] = useState(lampsRemaining)
  const [fadingIndex, setFadingIndex] = useState(null)       // which lamp is dying
  const [phase, setPhase] = useState(null)                   // 'flicker' → 'glow' → 'dissolve' → null
  const timeoutsRef = useRef([])

  useEffect(() => {
    // Clear any running timeouts on cleanup
    return () => timeoutsRef.current.forEach(t => clearTimeout(t))
  }, [])

  useEffect(() => {
    if (lampsRemaining < displayLamps) {
      const dyingIndex = displayLamps - 1
      setFadingIndex(dyingIndex)

      // Phase 1: Flicker (flame stutters)
      setPhase('flicker')

      const t1 = setTimeout(() => {
        // Phase 2: Bright glow (last flare)
        setPhase('glow')
      }, 1200)

      const t2 = setTimeout(() => {
        // Phase 3: Dissolve (fade out + particles)
        setPhase('dissolve')
      }, 2200)

      const t3 = setTimeout(() => {
        // Done — remove lamp from DOM
        setDisplayLamps(lampsRemaining)
        setFadingIndex(null)
        setPhase(null)
      }, 3600)

      timeoutsRef.current = [t1, t2, t3]
    }
  }, [lampsRemaining, displayLamps])

  const isLastLamp = lampsRemaining === 1

  return (
    <div className={`lamp-display-container ${isLastLamp ? 'final-state' : ''}`}>
      <div className="lamps-grid">
        {Array.from({ length: displayLamps }).map((_, index) => {
          const isDying = index === fadingIndex
          const phaseClass = isDying && phase ? `lamp-${phase}` : ''

          return (
            <div
              key={index}
              className={`lamp-item ${isLastLamp ? 'glowing-lamp' : ''} ${phaseClass}`}
            >
              {/* Particle burst layer (only on dissolve) */}
              {isDying && phase === 'dissolve' && (
                <div className="lamp-particles" aria-hidden="true">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i} className="lamp-spark" style={{
                      '--angle': `${i * 30}deg`,
                      '--dist': `${60 + Math.random() * 40}px`,
                      '--size': `${3 + Math.random() * 4}px`,
                      '--delay': `${Math.random() * 200}ms`,
                    }} />
                  ))}
                </div>
              )}

              {/* Smoke wisps (on glow + dissolve phases) */}
              {isDying && (phase === 'glow' || phase === 'dissolve') && (
                <div className="lamp-smoke" aria-hidden="true">
                  <span className="smoke-wisp" style={{ '--drift': '-15px', '--delay': '0ms' }} />
                  <span className="smoke-wisp" style={{ '--drift': '10px', '--delay': '200ms' }} />
                  <span className="smoke-wisp" style={{ '--drift': '-8px', '--delay': '400ms' }} />
                </div>
              )}

              <img
                src={lamp}
                alt={`Lamp ${index + 1}`}
                className="lamp-image"
              />

              {/* Glow ring for the last remaining lamp */}
              {isLastLamp && <div className="glow-effect" />}

              {/* Last-flare glow ring for dying lamp */}
              {isDying && phase === 'glow' && (
                <div className="lamp-flare-ring" />
              )}
            </div>
          )
        })}
      </div>

      {showMessage && isLastLamp && (
        <div className="relic-message-container">
          <h2 className="relic-message fade-in">You Have Found The True Relic!</h2>
          <p className="relic-subtitle fade-in">The final lamp reveals your mystical triumph</p>
        </div>
      )}

      <div className="lamps-counter">
        <span className="counter-text">
          {lampsRemaining} of 4 Lamps Remaining
        </span>
      </div>
    </div>
  )
}
