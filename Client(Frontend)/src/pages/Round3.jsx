import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import RoundHeader from '../components/RoundHeader'
import ActionButtons from '../components/ActionButtons'
import ResultMessage from '../components/ResultMessage'
import { startTimer, autoSubmitRound, showResults } from '../utils/roundFlow'
import FlowBuilder from './flowchart/src/pages/FlowBuilder'
import DebugRound from './flowchart/src/debug/DebugRound'

const ROUND_DURATION = 1200
const POINTS_PER_SOLVED_PROBLEM = 5

const SECTION_OPTIONS = [
  { key: 'flowchart', label: 'Flowchart Challenges' },
  { key: 'debug', label: 'Debug Code Challenges' }
]

export default function Round3({ reduceLamps }) {
  const navigate = useNavigate()
  const hasReducedRef = useRef(false)
  const submittedRef = useRef(false)
  const [activeSection, setActiveSection] = useState(null)
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION)
  const [isRoundLocked, setIsRoundLocked] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [flowchartSolvedCount, setFlowchartSolvedCount] = useState(0)
  const [debugSolvedCount, setDebugSolvedCount] = useState(0)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    if (isRoundLocked) return

    const stopTimer = startTimer({
      duration: ROUND_DURATION,
      onTick: setTimeLeft,
      onTimeUp: handleTimeUp,
      isLocked: () => submittedRef.current || isRoundLocked
    })

    return stopTimer
  }, [isRoundLocked])

  const getProgressState = () => {
    const totalSolved = flowchartSolvedCount + debugSolvedCount
    const isEligibleWinner = flowchartSolvedCount >= 2 && debugSolvedCount >= 2 && totalSolved >= 4

    return {
      totalSolved,
      isEligibleWinner
    }
  }

  const finalizeRound = (wasAutoSubmitted) => {
    const round1Score = Number(localStorage.getItem('round1Score') || 0)
    const round2Score = Number(localStorage.getItem('round2Score') || 0)
    const { totalSolved, isEligibleWinner } = getProgressState()

    const round3Score = totalSolved * POINTS_PER_SOLVED_PROBLEM
    const totalScore = round1Score + round2Score + round3Score
    const elapsedSeconds = Math.min(Math.max(ROUND_DURATION - timeLeft, 0), ROUND_DURATION)

    localStorage.setItem('round3Score', String(round3Score))

    if (!hasReducedRef.current && reduceLamps) {
      hasReducedRef.current = true
      reduceLamps()
    }

    showResults({
      navigate,
      mode: 'final',
      resultData: {
        score: totalScore,
        timeTakenSeconds: elapsedSeconds,
        qualificationStatus: isEligibleWinner ? 'Qualified' : 'Not Qualified',
        wasAutoSubmitted,
        isWinner: isEligibleWinner
      }
    })
  }

  const handleTimeUp = async () => {
    if (submittedRef.current) return

    setStatusMessage('Time is up! Submitting your completed challenges...')
    await autoSubmitRound({
      submittedRef,
      lockRound: () => setIsRoundLocked(true),
      submitRound: () => finalizeRound(true)
    })
  }

  const handleSubmitRound = async () => {
    if (submittedRef.current || isRoundLocked) return

    const { isEligibleWinner } = getProgressState()

    if (!isEligibleWinner) {
      setStatusMessage('Complete at least 2 Flowchart and 2 Debug challenges before final submission.')
      return
    }

    setStatusMessage('You have successfully decoded the relic. Victory lies within the code.')
    await new Promise((resolve) => setTimeout(resolve, 900))
    await autoSubmitRound({
      submittedRef,
      lockRound: () => setIsRoundLocked(true),
      submitRound: () => finalizeRound(false)
    })
  }

  const totalSolved = flowchartSolvedCount + debugSolvedCount

  return (
    <>
      <Background />
      <main className="event-container">
        <RoundHeader
          roundTitle="ROUND 3"
          subtitle="Complete any 4 challenges with at least 2 from each section."
          lampsRemaining={null}
          timeLeft={timeLeft}
          showTimer={true}
        />

        {!activeSection ? (
          <section className="question-display">
            <h2 className="question-text">Choose your challenge section</h2>
            <div className="options-grid">
              {SECTION_OPTIONS.map((option) => (
                <div
                  key={option.key}
                  className="option-card"
                  onClick={() => setActiveSection(option.key)}
                >
                  <p>{option.label}</p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <>
            <section className="round-actions" style={{ paddingTop: 0 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setActiveSection('flowchart')}
                disabled={isRoundLocked || activeSection === 'flowchart'}
              >
                Switch to Flowchart Challenges
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setActiveSection('debug')}
                disabled={isRoundLocked || activeSection === 'debug'}
              >
                Switch to Debug Code Challenges
              </button>
            </section>

            {activeSection === 'flowchart' ? (
              <FlowBuilder
                isRoundLocked={isRoundLocked}
                timeLeft={timeLeft}
                isTimerRunning={!isRoundLocked}
                onProgressChange={(payload) => setFlowchartSolvedCount(payload.solvedCount)}
              />
            ) : (
              <DebugRound
                isRoundLocked={isRoundLocked}
                onProgressChange={(payload) => setDebugSolvedCount(payload.solvedCount)}
              />
            )}
          </>
        )}

        {activeSection && (
          <section className="score-card">
            <div className="score-item">
              <span className="score-label">Flowchart Solved</span>
              <span className="score-value">{flowchartSolvedCount} / 4</span>
            </div>
            <div className="score-item">
              <span className="score-label">Debug Solved</span>
              <span className="score-value">{debugSolvedCount} / 3</span>
            </div>
            <div className="score-item total">
              <span className="score-label">Total Solved</span>
              <span className="score-value">{totalSolved} / 7</span>
            </div>
          </section>
        )}

        <ResultMessage
          message={statusMessage}
          type={statusMessage === 'You have successfully decoded the relic. Victory lies within the code.' ? 'success' : 'info'}
          visible={!!statusMessage}
        />

        <ActionButtons
          buttons={[
            { label: 'Flowchart Challenges', variant: 'btn-secondary', onClick: () => setActiveSection('flowchart'), disabled: isRoundLocked },
            { label: 'Debug Code Challenges', variant: 'btn-secondary', onClick: () => setActiveSection('debug'), disabled: isRoundLocked },
            { label: 'Submit Round 3', variant: 'btn-golden', onClick: handleSubmitRound, disabled: isRoundLocked || submittedRef.current }
          ]}
        />
      </main>
    </>
  )
}
