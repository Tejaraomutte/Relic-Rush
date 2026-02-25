import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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
      </Routes>
    </Router>
  )
}
