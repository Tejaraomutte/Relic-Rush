import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import GenieRevealOverlay from '../components/GenieRevealOverlay'
import LampDisplay from '../components/LampDisplay'
import { getLeaderboard, submitRoundScore } from '../utils/api'
import { triggerGenieReveal } from '../utils/roundFlow'
import './Results.css'

/* ─── Reveal helper ─── */
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('revealed'); obs.unobserve(el) } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}
function Reveal({ children, className = '', delay = 0 }) {
  const ref = useReveal()
  return (
    <div ref={ref} className={`reveal-on-scroll ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/* ─── Medal helper ─── */
function getMedal(rank) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return null
}

/* ═══════════════════════════════════════════
   MAIN RESULTS COMPONENT
   ═══════════════════════════════════════════ */
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
  const [showRelicStory, setShowRelicStory] = useState(false)
  const finalSubmittedRef = useRef(false)
  const revealTriggeredRef = useRef(false)

  useEffect(() => {
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
      triggerGenieReveal({ setRevealActive, setInteractionLocked, setRevealPlayed })
    }
  }, [navigate, isFinalMode, isWinnerFromState, revealPlayed])

  useEffect(() => {
    if (revealPlayed) localStorage.setItem('genieRevealPlayed', 'true')
  }, [revealPlayed])

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard()
      setLeaderboard(data.slice(0, 10) || [])
    } catch (e) { console.error('Error loading leaderboard:', e) }
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
    } catch (e) { console.error('Error submitting final score:', e) }
  }

  const formatDuration = (seconds) => {
    if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  const resolvedScore = resultData?.score ?? (isFinalMode ? totalScore : isRound2Mode ? round2Score : round1Score)
  const resolvedTimeTaken = resultData?.timeTakenSeconds
  const resolvedQualification = resultData?.qualificationStatus || (isFinalMode ? (isWinnerFromState ? 'Qualified' : 'Not Qualified') : 'Qualified')
  const isRound1Qualified = round1Score >= 10
  const resultLampsRemaining = isRound1Mode ? 3 : isRound2Mode ? 2 : 1

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
          <LampDisplay lampsRemaining={resultLampsRemaining} showMessage={isFinalMode && isWinnerFromState} />
        </div>

        <div className="score-card result-panel-card">
          <div className="score-item">
            <span className="score-label">Score</span>
            <span className="score-value">{resolvedScore}</span>
          </div>
          <div className="score-item">
            <span className="score-label">Time Taken</span>
            <span className="score-value result-meta">{typeof resolvedTimeTaken === 'number' ? formatDuration(resolvedTimeTaken) : 'N/A'}</span>
          </div>
          <div className="score-item">
            <span className="score-label">Qualification Status</span>
            <span className="score-value result-meta">{resolvedQualification}</span>
          </div>
        </div>

        {/* ═══ LEADERBOARD ═══ */}
        {isFinalMode && (
          <Reveal delay={500}>
            <div className="res-leaderboard">
              <h3 className="res-leaderboard-heading">
                <span className="res-gradient-text">Top 10</span> Champions
              </h3>
              {leaderboard.length === 0 ? (
                <p className="res-empty-msg">No scores yet. Be the first to conquer!</p>
              ) : (
                <div className="res-leaderboard-list">
                  {leaderboard.map((entry, index) => (
                    <div key={index} className={`res-lb-row ${index < 3 ? 'res-lb-top' : ''}`}>
                      <div className="res-lb-rank">
                        {getMedal(index + 1) || <span className="res-lb-rank-num">{index + 1}</span>}
                      </div>
                      <div className="res-lb-name">{entry.teamName || entry.name || entry.email}</div>
                      <div className="res-lb-score">{entry.totalScore || 0}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        )}

        {/* ═══ RELIC HIDDEN ═══ */}
        {isFinalMode && !isWinnerFromState && (
          <Reveal delay={550}>
            <div className="res-hidden-msg"><span>🌙</span> The relic remains hidden…</div>
          </Reveal>
        )}

        <div className="result-actions">
          {isRound1Mode && isRound1Qualified && <button className="btn btn-secondary" onClick={() => navigate('/round2')}>Next Round</button>}
          {isRound1Mode && !isRound1Qualified && <button className="btn btn-secondary" onClick={() => navigate('/home')}>Eliminated (Score below 10)</button>}
          {isRound2Mode && <button className="btn btn-secondary" onClick={() => navigate('/round3')}>Enter Round 3</button>}
          {isFinalMode && <button className="btn btn-golden" onClick={() => navigate('/relic-story')}>View Lamp</button>}
        </div>
      </main>

      <GenieRevealOverlay
        active={isFinalMode && isWinnerFromState && revealActive}
        onComplete={() => { setRevealActive(false); setInteractionLocked(false); setRevealPlayed(true) }}
      />
    </>
  )
}
