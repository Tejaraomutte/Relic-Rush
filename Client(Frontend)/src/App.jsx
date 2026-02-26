import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Round1 from './pages/Round1'
import Round2 from './pages/Round2'
import Round3 from './pages/Round3'
import Results from './pages/Results'
import RelicRevealStoryPage from './pages/RelicRevealStoryPage'
import Landing from './pages/Landing'
import StorySlides from './pages/StorySlides'
import CursorTrail from './components/CursorTrail'
import Leaderboard from './pages/Leaderboard'
import { getActiveRound, loadGameSession } from './utils/sessionManager'

function shouldShowCursorTrail(pathname = '') {
  const disabledRoutes = ['/round1', '/round2', '/round3']
  return !disabledRoutes.some((route) => pathname.startsWith(route))
}

function ProtectedRoute({ children }) {
  const teamName = localStorage.getItem('teamName')
  const user = localStorage.getItem('user')
  const isLoggedIn = () => Boolean(teamName && user)

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Route guard to prevent accessing Home page during active gameplay
function HomeGuard({ children }) {
  const activeRound = getActiveRound()
  const role = localStorage.getItem('role')
  
  // Admins can always access home
  if (role === 'admin') {
    return children
  }
  
  // If there's an active round, redirect to it
  if (activeRound && activeRound > 1) {
    return <Navigate to={`/round${activeRound}`} replace />
  }
  
  return children
}

function StoryGuard({ children }) {
  const role = localStorage.getItem('role')
  const storyUnlocked = localStorage.getItem('storyUnlocked') === 'true'

  if (role === 'admin') {
    return <Navigate to="/leaderboard" replace />
  }

  if (!storyUnlocked) {
    return <Navigate to="/home" replace />
  }

  return children
}

// Session restoration component
function SessionRestorer() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const teamName = localStorage.getItem('teamName')
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    
    // Only restore session for logged-in participants
    if (!teamName || !token || role === 'admin') return
    
    // Don't redirect if already on results page
    if (location.pathname === '/results') return
    
    // Check for active session
    const session = loadGameSession()
    if (!session) return
    
    const activeRound = session.currentRound
    const hasInProgressRoundState =
      activeRound >= 1 &&
      activeRound <= 3 &&
      Boolean(session[`round${activeRound}State`])

    if (!hasInProgressRoundState) return
    
    // If user is on login page but has active session, redirect to active round
    if (['/', '/login', '/home', '/story'].includes(location.pathname)) {
      navigate(`/round${activeRound}`, { replace: true })
      return
    }

  }, [navigate, location.pathname])

  return null
}

export default function App() {
  const [lampsRemaining, setLampsRemaining] = useState(4)

  // Initialize lamps from localStorage on mount
  useEffect(() => {
    const savedLamps = localStorage.getItem('lampsRemaining')
    if (savedLamps) {
      setLampsRemaining(parseInt(savedLamps, 10))
    } else {
      // First time - set initial 4 lamps
      localStorage.setItem('lampsRemaining', '4')
      setLampsRemaining(4)
    }
  }, [])

  // Sync lamp state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('lampsRemaining', lampsRemaining.toString())
  }, [lampsRemaining])

  // Function to reduce lamps (called after each round)
  const reduceLamps = () => {
    setLampsRemaining(prev => {
      const newCount = Math.max(prev - 1, 1)
      localStorage.setItem('lampsRemaining', newCount.toString())
      return newCount
    })
  }

  return (
    <Router>
      <AppContent
        lampsRemaining={lampsRemaining}
        reduceLamps={reduceLamps}
      />
    </Router>
  )
}

function AppContent({ lampsRemaining, reduceLamps }) {
  const location = useLocation()
  const showCursorTrail = shouldShowCursorTrail(location.pathname)

  return (
    <>
      {showCursorTrail && <CursorTrail />}
      <SessionRestorer />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <HomeGuard>
              <Home />
            </HomeGuard>
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/story" element={<ProtectedRoute><StoryGuard><StorySlides /></StoryGuard></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/round1" element={<ProtectedRoute><Round1 reduceLamps={reduceLamps} lampsRemaining={lampsRemaining} /></ProtectedRoute>} />
        <Route path="/round2" element={<ProtectedRoute><Round2 reduceLamps={reduceLamps} lampsRemaining={lampsRemaining} /></ProtectedRoute>} />
        <Route path="/round3" element={<ProtectedRoute><Round3 reduceLamps={reduceLamps} lampsRemaining={lampsRemaining} /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results lampsRemaining={lampsRemaining} /></ProtectedRoute>} />
        <Route path="/relic-story" element={<RelicRevealStoryPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}
