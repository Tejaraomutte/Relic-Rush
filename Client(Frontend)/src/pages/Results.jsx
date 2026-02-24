import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import GenieRevealOverlay from '../components/GenieRevealOverlay'
import lamp from '../assets/images/lamp.jpeg'
import { getLeaderboard } from '../utils/api'
import { triggerGenieReveal } from '../utils/roundFlow'

const API_URL = 'http://localhost:5000'

export default function Results({ lampsRemaining = 1 }) {
  const navigate = useNavigate()
  const location = useLocation()
  const mode = location.state?.mode || 'final'
  const resultData = location.state?.resultData || null
  const isRound1Mode = mode === 'round1'
  const isRound2Mode = mode === 'round2'
  const isFinalMode = mode === 'final'
  const isWinnerFromState = Boolean(resultData?.isWinner)
  const [round1Score, setRound1Score] = useState(0)
  const [round2Score, setRound2Score] = useState(0)
  const [round3Score, setRound3Score] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])
  const [revealActive, setRevealActive] = useState(false)
  const [interactionLocked, setInteractionLocked] = useState(false)
  const [revealPlayed, setRevealPlayed] = useState(() => localStorage.getItem('genieRevealPlayed') === 'true')
  const finalSubmittedRef = useRef(false)
  const revealTriggeredRef = useRef(false)

  useEffect(() => {
    // DEVELOPMENT MODE: Allow results page without login

    const r1 = parseInt(localStorage.getItem('round1Score')) || 0
    const r2 = parseInt(localStorage.getItem('round2Score')) || 0
    const r3 = parseInt(localStorage.getItem('round3Score')) || 0
    const total = r1 + r2 + r3

    setRound1Score(r1)
    setRound2Score(r2)
    setRound3Score(r3)
    setTotalScore(total)

    if (isFinalMode && !finalSubmittedRef.current) {
      finalSubmittedRef.current = true
      loadLeaderboard()
      submitFinalScore(r1, r2, r3, total)
    }

    if (isFinalMode && isWinnerFromState && !revealPlayed && !revealTriggeredRef.current) {
      revealTriggeredRef.current = true
      triggerGenieReveal({
        setRevealActive,
        setInteractionLocked,
        setRevealPlayed
      })
    }
  }, [navigate, isFinalMode, isWinnerFromState, revealPlayed])

  useEffect(() => {
    if (revealPlayed) {
      localStorage.setItem('genieRevealPlayed', 'true')
    }
  }, [revealPlayed])



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
    const token = localStorage.getItem('token')

    try {
      await fetch(`${API_URL}/api/submit-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          teamName: user.teamName,
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
    localStorage.removeItem('genieRevealPlayed')
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

  const formatDuration = (seconds) => {
    if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  const resolvedScore = resultData?.score ?? (isFinalMode ? totalScore : isRound2Mode ? round2Score : round1Score)
  const resolvedTimeTaken = resultData?.timeTakenSeconds

  return (
    <>
      <Background />
      <main className={`event-container result-container ${interactionLocked ? 'interaction-locked' : ''}`}>
        <header className="result-header">
          <h1 className="event-title">
            {isRound1Mode ? 'ROUND 1 RESULT' : isRound2Mode ? 'ROUND 2 RESULT' : "JOURNEY'S END"}
          </h1>
        </header>

        {isRound1Mode && (
          <p className="loading-text">Review your Round 1 score, then click Next Round to continue.</p>
        )}
        {isRound2Mode && (
          <p className="loading-text">Round 2 completed! Ready to face your next challenge?</p>
        )}

        <div className="result-lamp-wrap" aria-hidden="true">
          <div className={`result-lamp ${isFinalMode && isWinnerFromState ? 'genie-ready' : ''}`}>
            <img src={lamp} alt="Relic lamp" className="result-lamp-image" />
            <div className="result-lamp-glow" />
          </div>
        </div>

        <div className="score-card result-panel-card">
          <div className="score-item">
            <span className="score-label">Score</span>
            <span className="score-value">{resolvedScore}</span>
          </div>
          <div className="score-item">
            <span className="score-label">Time Taken</span>
            <span className="score-value result-meta">{formatDuration(resolvedTimeTaken)}</span>
          </div>
        </div>

        <div className="score-card">
          <div className="score-item">
            <span className="score-label">Round 1 Score</span>
            <span className="score-value">{round1Score}</span>
          </div>
          {!isRound1Mode && (
            <>
              <div className="score-item">
                <span className="score-label">Round 2 Score</span>
                <span className="score-value">{round2Score}</span>
              </div>
              {isFinalMode && (
                <>
                  <div className="score-item">
                    <span className="score-label">Round 3 Score</span>
                    <span className="score-value">{round3Score}</span>
                  </div>
                  <div className="score-item total">
                    <span className="score-label">Total Score</span>
                    <span className="score-value">{totalScore}</span>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {isFinalMode && (
          <div className="leaderboard-section">
            <h3>Top 10 Winners</h3>
            <div className="leaderboard-table">
              {leaderboard.length === 0 ? (
                <p className="loading-text">No scores yet. Be the first to complete!</p>
              ) : (
                leaderboard.map((entry, index) => (
                  <div key={index} className="leaderboard-row">
                    <div className="leaderboard-rank">{index + 1}</div>
                    <div className="leaderboard-name">{entry.teamName || entry.name || entry.email}</div>
                    <div className="leaderboard-score">{entry.totalScore || 0}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {isFinalMode && !isWinnerFromState && (
          <div className="result-message error visible relic-hidden-message">The relic remains hidden...</div>
        )}

        <div className="result-actions">
          {isRound1Mode && <button className="btn btn-secondary" onClick={() => navigate('/round2')}>Next Round</button>}
          {isRound2Mode && <button className="btn btn-secondary" onClick={() => navigate('/round3')}>Enter Round 3</button>}
          {isFinalMode && <button className="btn btn-secondary" onClick={handleShare}>Share Score</button>}
        </div>
      </main>

      <GenieRevealOverlay
        active={isFinalMode && isWinnerFromState && revealActive}
        onComplete={() => {
          setRevealActive(false)
          setInteractionLocked(false)
          setRevealPlayed(true)
        }}
      />
    </>
  )
}
