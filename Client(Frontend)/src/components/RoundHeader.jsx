import React, { useEffect, useRef, useState } from 'react'

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
  const [showFloatingTimer, setShowFloatingTimer] = useState(false)
  const headerRef = useRef(null)

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

  const hasTimer = showTimer && timeLeft !== null

  useEffect(() => {
    if (!hasTimer) {
      setShowFloatingTimer(false)
      return
    }

    const getScrollParent = (element) => {
      let parent = element?.parentElement
      while (parent) {
        const style = window.getComputedStyle(parent)
        const overflowY = style.overflowY
        if (overflowY === 'auto' || overflowY === 'scroll') {
          return parent
        }
        parent = parent.parentElement
      }
      return window
    }

    const scrollParent = getScrollParent(headerRef.current)

    const onScroll = () => {
      const scrollTop = scrollParent === window
        ? window.scrollY || document.documentElement.scrollTop || 0
        : scrollParent.scrollTop || 0
      setShowFloatingTimer(scrollTop > 12)
    }

    onScroll()
    if (scrollParent === window) {
      window.addEventListener('scroll', onScroll, { passive: true })
    } else {
      scrollParent.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('scroll', onScroll, { passive: true })
    }

    return () => {
      if (scrollParent === window) {
        window.removeEventListener('scroll', onScroll)
      } else {
        scrollParent.removeEventListener('scroll', onScroll)
        window.removeEventListener('scroll', onScroll)
      }
    }
  }, [hasTimer])

  return (
    <>
      <header ref={headerRef} className="round-header">
        <div className="header-top">
          <h1 className="round-title">{roundTitle}</h1>
          {lampsRemaining !== null && <div className="lamps-indicator">{lampsRemaining} Lamps Remaining</div>}
        </div>
        {subtitle && <p className="round-subtitle">{subtitle}</p>}
        {hasTimer && !showFloatingTimer && (
          <div className="timer-section timer-inline">
            <span className="timer-label">{timerLabel}:</span>
            <span className={`timer-display ${getTimerClass()}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </header>
      {hasTimer && showFloatingTimer && (
        <div className="timer-section timer-floating">
          <span className="timer-label">{timerLabel}:</span>
          <span className={`timer-display ${getTimerClass()}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      )}
    </>
  )
}
