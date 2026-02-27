import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import LampDisplay from '../components/LampDisplay'
import { getLeaderboard, submitRoundScore } from '../utils/api'
import './Results.css'

/* ───────── Reveal Hook ───────── */

function useReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

function Reveal({ children, delay = 0 }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className="reveal-on-scroll"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ───────── MAIN COMPONENT ───────── */

export default function Results({ lampsRemaining = 1 }) {
  const navigate = useNavigate()
  const location = useLocation()

  const mode = location.state?.mode || 'final'
  const resultData = location.state?.resultData || null

  const isRound1Mode = mode === 'round1'
  const isRound2Mode = mode === 'round2'
  const isFinalMode = mode === 'final'

  const [round1Score, setRound1Score] = useState(0)
  const [round2Score, setRound2Score] = useState(0)
  const [round3Score, setRound3Score] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])
  const [showRelicStory, setShowRelicStory] = useState(false)

  /* ───────── Load Scores ───────── */

  useEffect(() => {
    const r1 = parseInt(localStorage.getItem('round1Score')) || 0
    const r2 = parseInt(localStorage.getItem('round2Score')) || 0
    const r3 = parseInt(localStorage.getItem('round3Score')) || 0

    setRound1Score(r1)
    setRound2Score(r2)
    setRound3Score(r3)
    setTotalScore(r1 + r2 + r3)

    if (isFinalMode) {
      loadLeaderboard()
      submitFinalScore(r1, r2, r3, r1 + r2 + r3)
    }
  }, [isFinalMode])

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard()
      setLeaderboard(data.slice(0, 10) || [])
    } catch (e) {
      console.error('Leaderboard error:', e)
    }
  }

  const submitFinalScore = async (r1, r2, r3, total) => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user?.teamName) return

    try {
      await submitRoundScore(user.teamName, 'final', total, undefined, undefined, undefined, {
        round1: r1,
        round2: r2,
        round3: r3
      })
    } catch (e) {
      console.error('Submit score error:', e)
    }
  }

  const formatDuration = (seconds) => {
    const normalizedSeconds = Number(seconds)
    if (!Number.isFinite(normalizedSeconds) || normalizedSeconds < 0) return 'N/A'
    const totalSeconds = Math.floor(normalizedSeconds)
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m}m ${s}s`
  }

  const resolvedScore =
    resultData?.score ??
    (isFinalMode ? totalScore : isRound2Mode ? round2Score : round1Score)

  const resolvedTime = resultData?.timeTakenSeconds
  const resolvedQualification =
    resultData?.qualificationStatus ||
    (isFinalMode
      ? Boolean(resultData?.isWinner)
        ? 'Qualified'
        : 'Not Qualified'
      : 'Qualified')

  const isRound1Qualified = round1Score >= 10
  const resultLampsRemaining = isRound1Mode
    ? 3
    : isRound2Mode
    ? 2
    : 1

  const handleHome = () => {
    localStorage.clear()
    navigate('/')
  }

  const handleShare = () => {
    const text = `🎉 I found the True Relic!\nFinal Score: ${totalScore}`
    navigator.share
      ? navigator.share({ title: 'Relic Rush', text })
      : alert(text)
  }

  if (showRelicStory) {
    return (
      <>
        <Background />
        <div className="relic-story-container">
          <h2>Relic Reveal Story</h2>
          <button
            className="btn btn-golden"
            onClick={() => setShowRelicStory(false)}
          >
            ← Back to Score
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <Background />
      <main
        className="event-container result-container"
      >
        <header className="result-header">
          <h1 className="event-title">JOURNEY'S END</h1>
        </header>

        <div className="result-lamp-wrap">
          <LampDisplay
            lampsRemaining={resultLampsRemaining}
            showMessage={isFinalMode && Boolean(resultData?.isWinner)}
          />
        </div>

        <Reveal delay={100}>
          <div className="score-card result-panel-card">
            <div className="score-item">
              <span>Score</span>
              <span>{resolvedScore}</span>
            </div>
            <div className="score-item">
              <span>Time Taken</span>
              <span>
                {typeof resolvedTime === 'number'
                  ? formatDuration(resolvedTime)
                  : 'N/A'}
              </span>
            </div>
            <div className="score-item">
              <span>Status</span>
              <span>{resolvedQualification}</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="score-card">
            <div className="score-item">Round 1: {round1Score}</div>
            <div className="score-item">Round 2: {round2Score}</div>
            <div className="score-item">Round 3: {round3Score}</div>
            <div className="score-item total-score">Total: {totalScore}</div>
          </div>
        </Reveal>

        {isFinalMode && (
          <Reveal delay={200}>
            <div className="leaderboard-card">
              <h3>Top 10 Champions</h3>
              {leaderboard.map((entry, index) => (
                <div key={index} className="leaderboard-row">
                  <span>{index + 1}</span>
                  <span>{entry.teamName}</span>
                  <span>{entry.totalScore}</span>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        <div className="result-actions">
          <button className="res-btn-gold" onClick={handleHome}>Return Home</button>

          {isRound1Mode && isRound1Qualified && (
            <button className="res-btn-gold" onClick={() => navigate('/round2')}>
              Next Round
            </button>
          )}

          {isRound2Mode && (
            <button className="res-btn-gold" onClick={() => navigate('/round3')}>
              Enter Round 3
            </button>
          )}

          {isFinalMode && (
            <button className="res-btn-gold" onClick={handleShare}>Share Score</button>
          )}
        </div>
      </main>
    </>
  )
}