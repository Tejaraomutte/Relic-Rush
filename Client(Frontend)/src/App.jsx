import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom'
import PropTypes from 'prop-types'

import Home from './pages/Home'
import Login from './pages/Login'
import Round1 from './pages/Round1'
import Round2 from './pages/Round2'
import Round3 from './pages/Round3'
import Results from './pages/Results'
import Waiting from './pages/Waiting'
import RelicRevealStoryPage from './pages/RelicRevealStoryPage'
import Landing from './pages/Landing'
import StorySlides from './pages/StorySlides'
import Leaderboard from './pages/Leaderboard'
import CursorTrail from './components/CursorTrail'

/* ------------------ Cursor Visibility ------------------ */

function shouldShowCursorTrail(pathname = '') {
  const disabledRoutes = ['/round1', '/round2', '/round3']
  return !disabledRoutes.some(route => pathname.startsWith(route))
}

/* ------------------ Protected Route ------------------ */

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
}

/* ------------------ Home Guard ------------------ */

function HomeGuard({ children }) {
  const role = localStorage.getItem('role')

  if (role === 'admin') return children

  return children
}

/* ------------------ Story Guard ------------------ */

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

/* ------------------ Round Guard ------------------ */

function RoundGuard({ children }) {
  const role = localStorage.getItem('role')
  const storyUnlocked = localStorage.getItem('storyUnlocked') === 'true'
  const storyCompleted = localStorage.getItem('storyCompleted') === 'true'

  if (role === 'admin') {
    return <Navigate to="/leaderboard" replace />
  }

  if (!storyUnlocked) {
    return <Navigate to="/home" replace />
  }

  if (!storyCompleted) {
    return <Navigate to="/story" replace />
  }

  return children
}

/* ------------------ Relic Story Guard ------------------ */

function RelicStoryGuard({ children }) {
  const role = localStorage.getItem('role')
  const relicUnlocked = localStorage.getItem('relicUnlocked') === 'true'

  if (role === 'admin') {
    return <Navigate to="/leaderboard" replace />
  }

  if (!relicUnlocked) {
    return <Navigate to="/home" replace />
  }

  return children
}

/* ------------------ MAIN APP ------------------ */

export default function App() {
  const [lampsRemaining, setLampsRemaining] = useState(4)

  useEffect(() => {
    const saved = localStorage.getItem('lampsRemaining')
    if (saved) {
      setLampsRemaining(parseInt(saved, 10))
    } else {
      localStorage.setItem('lampsRemaining', '4')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('lampsRemaining', lampsRemaining.toString())
  }, [lampsRemaining])

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

/* ------------------ App Content ------------------ */

function AppContent({ lampsRemaining, reduceLamps }) {
  const location = useLocation()
  const showCursorTrail = shouldShowCursorTrail(location.pathname)

  return (
    <>
      {showCursorTrail && <CursorTrail />}

      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomeGuard>
                <Home />
              </HomeGuard>
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />

        <Route
          path="/story"
          element={
            <ProtectedRoute>
              <StoryGuard>
                <StorySlides />
              </StoryGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/round1"
          element={
            <ProtectedRoute>
              <RoundGuard>
                <Round1
                  reduceLamps={reduceLamps}
                  lampsRemaining={lampsRemaining}
                />
              </RoundGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/round2"
          element={
            <ProtectedRoute>
              <RoundGuard>
                <Round2
                  reduceLamps={reduceLamps}
                  lampsRemaining={lampsRemaining}
                />
              </RoundGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/round3"
          element={
            <ProtectedRoute>
              <RoundGuard>
                <Round3
                  reduceLamps={reduceLamps}
                  lampsRemaining={lampsRemaining}
                />
              </RoundGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/waiting"
          element={
            <ProtectedRoute>
              <Waiting />
            </ProtectedRoute>
          }
        />

        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <Results lampsRemaining={lampsRemaining} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/relic-story"
          element={
            <ProtectedRoute>
              <RelicStoryGuard>
                <RelicRevealStoryPage />
              </RelicStoryGuard>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}