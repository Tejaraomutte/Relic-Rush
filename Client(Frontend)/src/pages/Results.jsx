import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import LampDisplay from '../components/LampDisplay'
import { getLeaderboard } from '../utils/api'

const API_URL = 'http://localhost:5000'

export default function Results({ lampsRemaining = 1 }) {
  const navigate = useNavigate()
  const [round1Score, setRound1Score] = useState(0)
  const [round2Score, setRound2Score] = useState(0)
  const [round3Score, setRound3Score] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      navigate('/login')
      return
    }

    const r1 = parseInt(localStorage.getItem('round1Score')) || 0
    const r2 = parseInt(localStorage.getItem('round2Score')) || 0
    const r3 = parseInt(localStorage.getItem('round3Score')) || 0
    const total = r1 + r2 + r3

    setRound1Score(r1)
    setRound2Score(r2)
    setRound3Score(r3)
    setTotalScore(total)

    loadLeaderboard()
    submitFinalScore(r1, r2, r3, total)
  }, [navigate])

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard()
      setLeaderboard(data.slice(0, 10) || [])
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    }
  }

  const submitFinalScore = async (r1, r2, r3, total) => {
    const user = JSON.parse(localStorage.getItem('user'))

    try {
      await fetch(`${API_URL}/submit-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          round: 'final',
          score: total,
          round1: r1,
          round2: r2,
          round3: r3
        })
      })
    } catch (error) {
      console.error('Error submitting final score:', error)
    }
  }

  const handleHome = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('round1Score')
    localStorage.removeItem('round2Score')
    localStorage.removeItem('round3Score')
    localStorage.removeItem('lampsRemaining')
    navigate('/')
  }

  const handleShare = () => {
    const text = `🎉 I found the True Relic in Relic Rush!\n\nMy Final Score: ${totalScore}\n- Round 1: ${round1Score}\n- Round 2: ${round2Score}\n- Round 3: ${round3Score}\n\nCan you beat my score? 🧞‍♂️`
    if (navigator.share) {
      navigator.share({
        title: 'Relic Rush',
        text: text
      })
    } else {
      alert(text)
    }
  }

  return (
    <>
      <Background />
      <main className="event-container result-container">
        <header className="result-header">
          <h1 className="event-title">JOURNEY'S END</h1>
        </header>

        <LampDisplay lampsRemaining={lampsRemaining} showMessage={true} />

        <div className="score-card">
          <div className="score-item" style={{ animation: 'resultAppear 0.6s ease-out 0.2s both' }}>
            <span className="score-label">Round 1 Score</span>
            <span className="score-value">{round1Score}</span>
          </div>
          <div className="score-item" style={{ animation: 'resultAppear 0.6s ease-out 0.4s both' }}>
            <span className="score-label">Round 2 Score</span>
            <span className="score-value">{round2Score}</span>
          </div>
          <div className="score-item" style={{ animation: 'resultAppear 0.6s ease-out 0.6s both' }}>
            <span className="score-label">Round 3 Score</span>
            <span className="score-value">{round3Score}</span>
          </div>
          <div className="score-item total" style={{ animation: 'resultAppear 0.6s ease-out 0.8s both' }}>
            <span className="score-label">Total Score</span>
            <span className="score-value">{totalScore}</span>
          </div>
        </div>

        <div className="leaderboard-section">
          <h3>Top 10 Winners</h3>
          <div className="leaderboard-table">
            {leaderboard.length === 0 ? (
              <p className="loading-text">No scores yet. Be the first to complete!</p>
            ) : (
              leaderboard.map((entry, index) => (
                <div key={index} className="leaderboard-row" style={{ animation: `resultAppear 0.6s ease-out ${index * 0.1}s both` }}>
                  <div className="leaderboard-rank">{index + 1}</div>
                  <div className="leaderboard-name">{entry.name || entry.email}</div>
                  <div className="leaderboard-score">{entry.totalScore || 0}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="result-actions">
          <button className="btn btn-golden" onClick={handleHome}>Return Home</button>
          <button className="btn btn-secondary" onClick={handleShare}>Share Score</button>
        </div>
      </main>
    </>
  )
}
