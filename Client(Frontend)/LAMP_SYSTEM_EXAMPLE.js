/**
 * RELIC RUSH - LAMP DISPLAY SYSTEM
 * Complete Integration Example
 * 
 * This file demonstrates how the lamp system works end-to-end
 */

// ============================================
// 1. APP.JSX - GLOBAL LAMP STATE MANAGEMENT
// ============================================

import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Round1 from './pages/Round1'
import Round2 from './pages/Round2'
import Round3 from './pages/Round3'
import Results from './pages/Results'

/**
 * Key Points:
 * - Manages global lamp state (4 lamps initially)
 * - Syncs with localStorage for persistence
 * - Provides reduceLamps function to child routes
 * - Passes lampsRemaining to Results page
 */
export default function App() {
  const [lampsRemaining, setLampsRemaining] = useState(4)

  // Load from localStorage when app mounts
  useEffect(() => {
    const savedLamps = localStorage.getItem('lampsRemaining')
    if (savedLamps) {
      setLampsRemaining(parseInt(savedLamps, 10))
    } else {
      localStorage.setItem('lampsRemaining', '4')
      setLampsRemaining(4)
    }
  }, [])

  // Sync to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('lampsRemaining', lampsRemaining.toString())
  }, [lampsRemaining])

  // Called by round pages when they complete
  const reduceLamps = () => {
    setLampsRemaining(prev => Math.max(prev - 1, 1))
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Pass reduceLamps to each round */}
        <Route path="/round1" element={<Round1 reduceLamps={reduceLamps} />} />
        <Route path="/round2" element={<Round2 reduceLamps={reduceLamps} />} />
        <Route path="/round3" element={<Round3 reduceLamps={reduceLamps} />} />
        
        {/* Pass final lamp count to results */}
        <Route path="/results" element={<Results lampsRemaining={lampsRemaining} />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

// ============================================
// 2. ROUND PAGES - CALLING reduceLamps
// ============================================

/**
 * Round1.jsx, Round2.jsx, Round3.jsx pattern:
 * 
 * - Accept reduceLamps as prop
 * - Call it before navigating to next page
 * - This reduces lamp state globally
 */

// In Round1.jsx
export default function Round1({ reduceLamps }) {
  // ... round logic ...

  const calculateAndSubmitRound = async (answers) => {
    // ... scoring logic ...
    
    // Show completion message
    setResultMessage(`🎉 Round 1 Completed!`)
    
    // Wait for animation, then reduce lamps and navigate
    setTimeout(() => {
      if (reduceLamps) reduceLamps()  // 4 → 3
      navigate('/round2')
    }, 2000)
  }
}

// In Round2.jsx
export default function Round2({ reduceLamps }) {
  // ... round logic ...
  
  const finishRound = async () => {
    // ... scoring logic ...
    
    setTimeout(() => {
      if (reduceLamps) reduceLamps()  // 3 → 2
      navigate('/round3')
    }, 1600)
  }
}

// In Round3.jsx
export default function Round3({ reduceLamps }) {
  // ... round logic ...
  
  const calculateAndSubmitRound = async (answers) => {
    // ... scoring logic ...
    
    setTimeout(() => {
      if (reduceLamps) reduceLamps()  // 2 → 1
      navigate('/results')
    }, 2000)
  }
}

// ============================================
// 3. LAMP PROGRESSION DURING GAME
// ============================================

/**
 * GameFlow:
 * 
 * START (Home/Login)
 * └─ localStorage: lampsRemaining = 4
 * │
 * ├─ ROUND 1
 * │  └─ Complete → reduceLamps() called
 * │     localStorage: lampsRemaining = 3
 * │
 * ├─ ROUND 2
 * │  └─ Complete → reduceLamps() called
 * │     localStorage: lampsRemaining = 2
 * │
 * ├─ ROUND 3
 * │  └─ Complete → reduceLamps() called
 * │     localStorage: lampsRemaining = 1
 * │
 * └─ RESULTS PAGE
 *    └─ Displays LampDisplay with lampsRemaining = 1
 *       └─ Shows golden glow animation
 *          Shows victory message
 *          Shows leaderboard
 */

// ============================================
// 4. RESULTS PAGE - DISPLAYING LAMPS
// ============================================

import LampDisplay from '../components/LampDisplay'

/**
 * Results.jsx - Shows final lamp display
 */
export default function Results({ lampsRemaining = 1 }) {
  const navigate = useNavigate()
  const [scores, setScores] = useState({
    round1: 0,
    round2: 0,
    round3: 0
  })

  return (
    <>
      <Background />
      <main className="event-container result-container">
        <header className="result-header">
          <h1 className="event-title">JOURNEY'S END</h1>
        </header>

        {/* Main Feature: LampDisplay Component */}
        <LampDisplay 
          lampsRemaining={lampsRemaining}  // Pass final count
          showMessage={true}                // Show victory message
        />

        {/* Rest of results page */}
        <div className="score-card">
          {/* Score display */}
        </div>

        <div className="leaderboard-section">
          {/* Leaderboard */}
        </div>

        <div className="result-actions">
          <button className="btn btn-golden" onClick={handleHome}>
            Return Home
          </button>
        </div>
      </main>
    </>
  )
}

// ============================================
// 5. LAMP DISPLAY COMPONENT
// ============================================

import lamp from '../assets/lamp.png'
import '../styles/LampDisplay.css'

/**
 * LampDisplay.jsx - Reusable lamp display component
 * 
 * Props:
 * - lampsRemaining (number): How many lamps to display
 * - showMessage (boolean): Show victory message when lampsRemaining === 1
 */
export default function LampDisplay({ lampsRemaining = 4, showMessage = false }) {
  const [displayLamps, setDisplayLamps] = useState(lampsRemaining)
  const [fadeOut, setFadeOut] = useState({})

  // Handle lamp reduction animation
  useEffect(() => {
    if (lampsRemaining < displayLamps) {
      const lampToRemove = displayLamps - 1
      setFadeOut(prev => ({ ...prev, [lampToRemove]: true }))
      
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
      {/* Grid of lamps */}
      <div className="lamps-grid">
        {Array.from({ length: displayLamps }).map((_, index) => (
          <div
            key={index}
            className={`lamp-item ${isLastLamp ? 'glowing-lamp' : ''}`}
          >
            <img src={lamp} alt={`Lamp ${index + 1}`} className="lamp-image" />
            {isLastLamp && <div className="glow-effect"></div>}
          </div>
        ))}
      </div>

      {/* Victory message when last lamp remains */}
      {showMessage && isLastLamp && (
        <div className="relic-message-container">
          <h2 className="relic-message fade-in">
            You Have Found The True Relic!
          </h2>
          <p className="relic-subtitle fade-in">
            The final lamp reveals your mystical triumph
          </p>
        </div>
      )}

      {/* Counter display */}
      <div className="lamps-counter">
        <span className="counter-text">
          {lampsRemaining} of 4 Lamps Remaining
        </span>
      </div>
    </div>
  )
}

// ============================================
// 6. STYLING - KEY ANIMATIONS
// ============================================

/**
 * LampDisplay.css - Key features:
 * 
 * 1. Container gradients:
 *    - Dark purple/midnight blue background
 *    - Golden border and shadow effects
 *    
 * 2. Lamp grid layout:
 *    - Flexbox centering
 *    - Responsive gaps
 *    - Hover effects
 *    
 * 3. Glow animation (when lampsRemaining === 1):
 *    - lampGlow: Main lamp pulse effect
 *    - glowPulse: Radial glow aura
 *    - Continuous 3s cycle
 *    
 * 4. Fade animations:
 *    - lampFadeOut: When lamps disappear
 *    - messageAppear: Victory message fade-in
 *    - fadeInText: Text appear effect
 */

// ============================================
// 7. TESTING THE SYSTEM
// ============================================

/**
 * Test Checklist:
 * 
 * [ ] Start app - should display 4 lamps
 * [ ] Check localStorage.getItem('lampsRemaining') === '4'
 * [ ] Complete Round 1 - should show 3 lamps
 * [ ] Check localStorage.getItem('lampsRemaining') === '3'
 * [ ] Complete Round 2 - should show 2 lamps
 * [ ] Check localStorage.getItem('lampsRemaining') === '2'
 * [ ] Complete Round 3 - should reduce to 1 lamp
 * [ ] Results page should show:
 *     - 1 lamp with golden glow
 *     - Victory message: "You Have Found The True Relic!"
 *     - Continuous glow animation
 * [ ] Return home - should reset lamps to 4
 * [ ] Refresh page - should maintain lamp count
 */

// ============================================
// 8. BROWSER DEVTOOLS DEBUGGING
// ============================================

/**
 * In Browser Console:
 * 
 * // Check current lamp count
 * localStorage.getItem('lampsRemaining')
 * 
 * // Manually set lamp count (for testing)
 * localStorage.setItem('lampsRemaining', '1')
 * 
 * // Clear all game data
 * localStorage.removeItem('lampsRemaining')
 * localStorage.removeItem('round1Score')
 * localStorage.removeItem('round2Score')
 * localStorage.removeItem('round3Score')
 * localStorage.removeItem('user')
 */

// ============================================
// 9. LOCALSTORAGE SCHEMA
// ============================================

/**
 * How lamps are stored:
 * 
 * Key: 'lampsRemaining'
 * Type: String (number)
 * Values: '4', '3', '2', '1'
 * Default: '4'
 * 
 * Lifecycle:
 * - Created: When app loads for first time
 * - Updated: After each round completion
 * - Deleted: When user returns to home
 */

// ============================================
// 10. CUSTOMIZATION OPTIONS
// ============================================

/**
 * To customize:
 * 
 * 1. Change lamp size:
 *    CSS: .lamp-item { width: 100px; height: 100px; }
 *    
 * 2. Change glow color:
 *    CSS: rgba(218, 165, 32, ...) → change RGB values
 *    
 * 3. Change animation speed:
 *    CSS: animation: lampGlow 3s ... → change 3s
 *    
 * 4. Change background colors:
 *    CSS: linear-gradient(...) → modify gradient colors
 *    
 * 5. Add sound effects:
 *    Add in Round pages when reduceLamps() is called
 *    Add in Results page for victory animation
 */

export const LAMP_CONFIG = {
  INITIAL_LAMPS: 4,
  ROUNDS: 3,
  GLOW_COLOR: 'rgba(218, 165, 32, 0.5)',
  STORAGE_KEY: 'lampsRemaining'
}
