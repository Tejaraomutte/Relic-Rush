import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Round1 from './pages/Round1'
import Round2 from './pages/Round2'
import Results from './pages/Results'

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
      return newCount
    })
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/round1" element={<Round1 reduceLamps={reduceLamps} />} />
        <Route path="/round2" element={<Round2 />} />
        <Route path="/results" element={<Results lampsRemaining={lampsRemaining} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}
