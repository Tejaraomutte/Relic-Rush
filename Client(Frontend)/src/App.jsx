import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Round1 from './pages/Round1'
import Round2 from './pages/Round2'
import Round3 from './pages/Round3'
import Results from './pages/Results'
<<<<<<< HEAD
import RelicRevealStoryPage from './pages/RelicRevealStoryPage'
import Landing from './pages/Landing'
import StorySlides from './pages/StorySlides'
import CursorTrail from './components/CursorTrail'
=======
import Leaderboard from './pages/Leaderboard'
import { getActiveRound, loadGameSession, isRoundCompleted } from './utils/sessionManager'

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
  if (activeRound) {
    return <Navigate to={`/round${activeRound}`} replace />
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
    
    // If user is on login page but has active session, redirect to active round
    if (location.pathname === '/login' || location.pathname === '/home' || location.pathname === '/') {
      if (activeRound && activeRound >= 1 && activeRound <= 3) {
        navigate(`/round${activeRound}`, { replace: true })
      }
    }
  }, [navigate, location.pathname])

  return null
}
>>>>>>> b4a059d608ac67c01500fd94bab75f59d1eb5654

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
<<<<<<< HEAD
      <CursorTrail />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/story" element={<StorySlides />} />
        <Route path="/round1" element={<Round1 reduceLamps={reduceLamps} lampsRemaining={lampsRemaining} />} />
        <Route path="/round2" element={<Round2 reduceLamps={reduceLamps} lampsRemaining={lampsRemaining} />} />
        <Route path="/round3" element={<Round3 reduceLamps={reduceLamps} lampsRemaining={lampsRemaining} />} />
        <Route path="/results" element={<Results lampsRemaining={lampsRemaining} />} />
        <Route path="/relic-story" element={<RelicRevealStoryPage />} />
        {/* Optionally, add a 404 page here instead of redirecting everything to landing/login */}
        {/* <Route path="*" element={<NotFound />} /> */}
=======
      <SessionRestorer />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <HomeGuard>
              <Home />
            </HomeGuard>
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/round1" element={<ProtectedRoute><Round1 reduceLamps={reduceLamps} lampsRemaining={lampsRemaining} /></ProtectedRoute>} />
        <Route path="/round2" element={<ProtectedRoute><Round2 reduceLamps={reduceLamps} lampsRemaining={lampsRemaining} /></ProtectedRoute>} />
        <Route path="/round3" element={<ProtectedRoute><Round3 reduceLamps={reduceLamps} lampsRemaining={lampsRemaining} /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results lampsRemaining={lampsRemaining} /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
>>>>>>> b4a059d608ac67c01500fd94bab75f59d1eb5654
      </Routes>
    </Router>
  )
}
