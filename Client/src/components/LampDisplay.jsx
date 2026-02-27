import React, { useEffect, useState, useRef } from 'react'
import lamp from '../assets/images/lamp2.png'
import '../styles/LampDisplay.css'

export default function LampDisplay({ lampsRemaining = 4, showMessage = false }) {
  const [displayLamps, setDisplayLamps] = useState(lampsRemaining)
  const [fadingIndex, setFadingIndex] = useState(null)       // which lamp is dying
  const [phase, setPhase] = useState(null)                   // 'glow' → 'dissolve' → null
  const [showEliminationMessage, setShowEliminationMessage] = useState(false)
  const timeoutsRef = useRef([])

  const clearTimers = () => {
    timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId))
    timeoutsRef.current = []
  }

  useEffect(() => {
    return () => clearTimers()
  }, [])

  useEffect(() => {
    if (lampsRemaining > displayLamps) {
      clearTimers()
      setDisplayLamps(lampsRemaining)
      setFadingIndex(null)
      setPhase(null)
      setShowEliminationMessage(false)
      return
    }

    if (lampsRemaining === displayLamps) {
      return
    }

    if (lampsRemaining < displayLamps) {
      clearTimers()

      const dyingIndex = displayLamps - 1
      setFadingIndex(dyingIndex)
      setShowEliminationMessage(false)

      const t1 = setTimeout(() => {
        // Pre-fade glow aura
        setPhase('glow')
      }, 200)

      const t2 = setTimeout(() => {
        // Smooth fade + scale down
        setPhase('dissolve')
      }, 1500)

      const t3 = setTimeout(() => {
        // Done — remove lamp from DOM
        setDisplayLamps(lampsRemaining)
        setFadingIndex(null)
        setPhase(null)
        setShowEliminationMessage(true)
      }, 3300)

      timeoutsRef.current = [t1, t2, t3]
    }
  }, [lampsRemaining, displayLamps])

  const isLastLamp = displayLamps === 1

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

      {showEliminationMessage && (
        <div className="elimination-message-wrap" role="status" aria-live="polite">
          <div className="elimination-message-card">
            <h3>Congratulations!</h3>
            <p>You have successfully eliminated 1 duplicate lamp.</p>
          </div>
        </div>
      )}

      <div className="lamps-counter">
        <span className="counter-text">
          {displayLamps} of 4 Lamps Remaining
        </span>
      </div>
    </div>
  )
}
