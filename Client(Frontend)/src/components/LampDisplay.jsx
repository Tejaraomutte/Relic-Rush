import React, { useEffect, useState } from 'react'
import lamp from '../assets/images/lamp.jpeg'
import '../styles/LampDisplay.css'

export default function LampDisplay({ lampsRemaining = 4, showMessage = false }) {
  const [displayLamps, setDisplayLamps] = useState(lampsRemaining)
  const [fadeOut, setFadeOut] = useState({})

  useEffect(() => {
    if (lampsRemaining < displayLamps) {
      // Mark the lamp that's disappearing for fade-out animation
      const lampToRemove = displayLamps - 1
      setFadeOut(prev => ({ ...prev, [lampToRemove]: true }))
      
      // Update display after animation completes
      const timer = setTimeout(() => {
        setDisplayLamps(lampsRemaining)
        setFadeOut({})
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [lampsRemaining, displayLamps])

  const isLastLamp = lampsRemaining === 1

  return (
    <div className={`lamp-display-container ${isLastLamp ? 'final-state' : ''}`}>
      <div className="lamps-grid">
        {Array.from({ length: displayLamps }).map((_, index) => (
          <div
            key={index}
            className={`lamp-item ${isLastLamp ? 'glowing-lamp' : ''} ${
              fadeOut[index] ? 'fade-out' : ''
            }`}
          >
            <img
              src={lamp}
              alt={`Lamp ${index + 1}`}
              className="lamp-image"
            />
            {isLastLamp && <div className="glow-effect"></div>}
          </div>
        ))}
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
