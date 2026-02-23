import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Round1 from './pages/Round1'
import Round2 from './pages/Round2'
import Round3 from './pages/Round3'
import Results from './pages/Results'
import Leaderboard from './pages/Leaderboard'

function ProtectedRoute({ children }) {
  const teamName = localStorage.getItem('teamName')
  const user = localStorage.getItem('user')

  if (!teamName || !user) {
    return <Navigate to="/login" replace />
  }

  return children
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
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/round1" element={<ProtectedRoute><Round1 reduceLamps={reduceLamps} lampsRemaining={lampsRemaining} /></ProtectedRoute>} />
        <Route path="/round2" element={<ProtectedRoute><Round2 reduceLamps={reduceLamps} lampsRemaining={lampsRemaining} /></ProtectedRoute>} />
        <Route path="/round3" element={<ProtectedRoute><Round3 reduceLamps={reduceLamps} lampsRemaining={lampsRemaining} /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results lampsRemaining={lampsRemaining} /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}
