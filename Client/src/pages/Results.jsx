import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import LampDisplay from '../components/LampDisplay'
import { submitRoundScore } from '../utils/api'
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
  const [showRound1LampStage, setShowRound1LampStage] = useState(false)
  const [showRound2LampStage, setShowRound2LampStage] = useState(false)
  const [animatedLampCount, setAnimatedLampCount] = useState(4)

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
      submitFinalScore(r1, r2, r3, r1 + r2 + r3)
    }
  }, [isFinalMode])

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

  const effectiveRound1Score = isRound1Mode
    ? Number(resultData?.score ?? round1Score)
    : Number(round1Score)
  const isRound1Qualified = effectiveRound1Score >= 10

  const resolvedTime = resultData?.timeTakenSeconds
  const resolvedQualification =
    (isRound1Mode && !isRound1Qualified
      ? 'Disqualified'
      : resultData?.qualificationStatus) ||
    (isFinalMode
      ? Boolean(resultData?.isWinner)
        ? 'Qualified'
        : 'Not Qualified'
      : 'Qualified')

  const isRound1TransitionMode = isRound1Mode && isRound1Qualified
  const isRound2TransitionMode = isRound2Mode
  const resultLampsRemaining = isRound1Mode
    ? 3
    : isRound2Mode
    ? 2
    : 1
  const shouldShowRound1Lamps = !isRound1Mode || isRound1Qualified
  const shouldRenderLampStage =
    shouldShowRound1Lamps &&
    (!isRound1TransitionMode || showRound1LampStage) &&
    (!isRound2TransitionMode || showRound2LampStage)

  useEffect(() => {
    let timeoutId

    if (isRound1TransitionMode) {
      if (showRound1LampStage) {
        setAnimatedLampCount(4)
        timeoutId = setTimeout(() => {
          setAnimatedLampCount(3)
        }, 200)
      } else {
        setAnimatedLampCount(4)
      }
    } else if (isRound2TransitionMode) {
      if (showRound2LampStage) {
        setAnimatedLampCount(3)
        timeoutId = setTimeout(() => {
          setAnimatedLampCount(2)
        }, 200)
      } else {
        setAnimatedLampCount(3)
      }
    } else if (isFinalMode) {
      setAnimatedLampCount(1)
    } else {
      setAnimatedLampCount(resultLampsRemaining)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isRound1TransitionMode, showRound1LampStage, isRound2TransitionMode, showRound2LampStage, isFinalMode, resultLampsRemaining])

  const handleHome = () => {
    localStorage.clear()
    navigate('/')
  }

  const handleViewLamp = () => {
    navigate('/relic-story')
  }

  if (isFinalMode) {
    return (
      <>
        <Background />
        <main className="event-container result-container">
          <div className="result-lamp-wrap">
            <LampDisplay
              lampsRemaining={1}
              showMessage={true}
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

          <div className="result-actions">
            <button className="res-btn-gold" onClick={handleViewLamp}>View Lamp</button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Background />
      <main
        className="event-container result-container"
      >
    

        {shouldRenderLampStage && (
          <div className="result-lamp-wrap">
            <LampDisplay
              lampsRemaining={animatedLampCount}
              showMessage={isFinalMode && Boolean(resultData?.isWinner)}
            />
          </div>
        )}

        {isRound1Mode && !isRound1Qualified && (
          <Reveal delay={70}>
            <div className="res-hidden-msg">
              <span>⚠️</span>
              Disqualified
            </div>
          </Reveal>
        )}

        {!(isRound1TransitionMode && showRound1LampStage) && !(isRound2TransitionMode && showRound2LampStage) && (
          <>
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
          </>
        )}

        <div className="result-actions">
          {!isRound1TransitionMode && !isRound2TransitionMode && (
            <button className="res-btn-gold" onClick={handleHome}>Return Home</button>
          )}

          {isRound1TransitionMode && !showRound1LampStage && (
            <button className="res-btn-gold" onClick={() => setShowRound1LampStage(true)}>
              Next
            </button>
          )}

          {isRound1TransitionMode && showRound1LampStage && (
            <button className="res-btn-gold" onClick={() => navigate('/round2')}>
              Next Round
            </button>
          )}

          {isRound2TransitionMode && !showRound2LampStage && (
            <button className="res-btn-gold" onClick={() => setShowRound2LampStage(true)}>
              Next
            </button>
          )}

          {isRound2TransitionMode && showRound2LampStage && (
            <button className="res-btn-gold" onClick={() => navigate('/round3')}>
              Next Round
            </button>
          )}

        </div>
      </main>
    </>
  )
}