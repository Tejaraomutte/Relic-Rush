import React, { useEffect } from 'react'
import lamp from '../assets/images/lamp.jpeg'

const ANIMATION_DURATION_MS = 4700

export default function GenieRevealOverlay({
  active,
  onComplete,
  message = 'You have found the True Relic!'
}) {
  useEffect(() => {
    if (!active) return undefined

    const timerId = window.setTimeout(() => {
      onComplete?.()
    }, ANIMATION_DURATION_MS)

    return () => window.clearTimeout(timerId)
  }, [active, onComplete])

  if (!active) {
    return null
  }

  return (
    <div className="genie-overlay" role="dialog" aria-live="polite" aria-label="Genie reveal animation">
      <div className="genie-overlay-backdrop" />

      <div className="genie-scene">
        <div className="genie-lamp-core">
          <img src={lamp} alt="Original lamp" className="genie-lamp-image" />
          <div className="lamp-aura" />
        </div>

        <div className="smoke-column" aria-hidden="true">
          <span className="smoke smoke-1" />
          <span className="smoke smoke-2" />
          <span className="smoke smoke-3" />
          <span className="smoke smoke-4" />
        </div>

        <div className="genie-body" aria-hidden="true">
          <div className="genie-head" />
          <div className="genie-tail" />
        </div>

        <div className="sparkles" aria-hidden="true">
          <span className="sparkle sp-1" />
          <span className="sparkle sp-2" />
          <span className="sparkle sp-3" />
          <span className="sparkle sp-4" />
        </div>

        <div className="genie-message-wrap">
          <h2 className="genie-reveal-text">{message}</h2>
        </div>
      </div>
    </div>
  )
}
