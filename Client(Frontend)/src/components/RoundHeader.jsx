import React from 'react'

/**
 * Unified RoundHeader component for all rounds
 * Displays round title, lamps remaining, and optional timer
 */
export default function RoundHeader({ 
  roundTitle = 'ROUND', 
  subtitle = '',
  lampsRemaining = 4, 
  timeLeft = null, 
  timerLabel = 'Time Remaining',
  showTimer = false 
}) {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const getTimerClass = () => {
    if (!showTimer || timeLeft === null) return ''
    if (timeLeft <= 10) return 'danger'
    if (timeLeft <= 30) return 'warning'
    return ''
  }

  return (
    <header className="round-header">
      <div className="header-top">
        <h1 className="round-title">{roundTitle}</h1>
        <div className="lamps-indicator">{lampsRemaining} Lamps Remaining</div>
      </div>
      {subtitle && <p className="round-subtitle">{subtitle}</p>}
      {showTimer && timeLeft !== null && (
        <div className="timer-section">
          <span className="timer-label">{timerLabel}:</span>
          <span className={`timer-display ${getTimerClass()}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      )}
    </header>
  )
}
