import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import RoundHeader from '../components/RoundHeader'
import ActionButtons from '../components/ActionButtons'
import ResultMessage from '../components/ResultMessage'
import { submitRoundScore } from '../utils/api'
import { startTimer, autoSubmitRound, showResults } from '../utils/roundFlow'
import FlowBuilder from './flowchart/src/pages/FlowBuilder'
import DebugRound from './flowchart/src/debug/DebugRound'
import { saveRoundState, loadRoundState, markRoundCompleted, isRoundCompleted, clearGameSession } from '../utils/sessionManager'

const ROUND_DURATION = 900
const POINTS_PER_SOLVED_PROBLEM = 5

const getElapsedSecondsFromStart = (startedAt, maxDurationSeconds) => {
  if (!Number.isFinite(startedAt)) return 0
  const elapsed = Math.floor((Date.now() - startedAt) / 1000)
  return Math.min(Math.max(elapsed, 0), maxDurationSeconds)
}

const SECTION_OPTIONS = [
  { key: 'flowchart', label: 'Flowchart Challenges' },
  { key: 'debug', label: 'Debug Code Challenges' }
]

export default function Round3({ reduceLamps }) {
  const navigate = useNavigate()
  const hasReducedRef = useRef(false)
  const submittedRef = useRef(false)
  const initialRoundStateRef = useRef(loadRoundState(3))
  const initialRoundState = initialRoundStateRef.current
  
  // Initialize state with saved values or defaults - load fresh on each mount
  const [activeSection, setActiveSection] = useState(() => {
    console.log('Round3 - Loading saved state:', initialRoundState)
    return initialRoundState?.activeSection ?? null
  })
  
  const [timeLeft, setTimeLeft] = useState(() => {
    return initialRoundState?.timeLeft ?? ROUND_DURATION
  })

  const startedAtRef = useRef(initialRoundState?.startedAt ?? Date.now())
  
  const timeLeftRef = useRef(initialRoundState?.timeLeft ?? ROUND_DURATION)
  
  const [flowchartSolvedCount, setFlowchartSolvedCount] = useState(() => {
    return initialRoundState?.flowchartSolvedCount ?? 0
  })
  
  const flowchartSolvedRef = useRef(initialRoundState?.flowchartSolvedCount ?? 0)
  
  const [debugSolvedCount, setDebugSolvedCount] = useState(() => {
    return initialRoundState?.debugSolvedCount ?? 0
  })
  
  const debugSolvedRef = useRef(initialRoundState?.debugSolvedCount ?? 0)
  
  const [isRoundLocked, setIsRoundLocked] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const blockCopy = (event) => event.preventDefault()

  const persistRoundState = () => {
    saveRoundState(3, {
      flowchartSolvedCount,
      debugSolvedCount,
      activeSection,
      timeLeft,
      startedAt: startedAtRef.current
    })
  }

  // Check if round already completed on mount
  useEffect(() => {
    const existingScore = Number(localStorage.getItem('round3Score') || 0)
    
    if (isRoundCompleted(3) || existingScore > 0) {
      navigate('/results', { state: { mode: 'final' }, replace: true })
    }
  }, [navigate])

  // Save state immediately whenever progress changes
  useEffect(() => {
    if (isRoundLocked || submittedRef.current) return

    persistRoundState()
  }, [flowchartSolvedCount, debugSolvedCount, activeSection, timeLeft, isRoundLocked])

  // Ensure latest progress is flushed during tab hide/unload/sleep transitions
  useEffect(() => {
    if (isRoundLocked || submittedRef.current) return

    const flushProgress = () => {
      persistRoundState()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushProgress()
      }
    }

    window.addEventListener('beforeunload', flushProgress)
    window.addEventListener('pagehide', flushProgress)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', flushProgress)
      window.removeEventListener('pagehide', flushProgress)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [flowchartSolvedCount, debugSolvedCount, activeSection, timeLeft, isRoundLocked])

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  useEffect(() => {
    if (isRoundLocked) return

    const stopTimer = startTimer({
      duration: timeLeftRef.current,
      onTick: setTimeLeft,
      onTimeUp: handleTimeUp,
      isLocked: () => submittedRef.current || isRoundLocked
    })

    return stopTimer
  }, [isRoundLocked])

  useEffect(() => {
    if (isRoundLocked || submittedRef.current) return

    const handlePopState = () => {
      if (!isRoundLocked && !submittedRef.current) {
        window.history.pushState(null, '', window.location.href)
      }
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)
    
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase()
      const isCtrlOrMeta = event.ctrlKey || event.metaKey
      const blockedCombo = isCtrlOrMeta && ['c', 'x', 'v', 'u', 's', 'p'].includes(key)
      const blockedDevtools = (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key)) || key === 'f12'
      const blockedPrint = key === 'printscreen'

      if (blockedCombo || blockedDevtools || blockedPrint) {
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isRoundLocked])

  const getProgressState = (flowSolved = flowchartSolvedRef.current, debugSolved = debugSolvedRef.current) => {
    const totalSolved = flowSolved + debugSolved
    const isEligibleWinner = flowSolved >= 2 && debugSolved >= 2 && totalSolved >= 4

    return {
      totalSolved,
      isEligibleWinner
    }
  }

  const finalizeRound = async (wasAutoSubmitted) => {
    const round1Score = Number(localStorage.getItem('round1Score') || 0)
    const round2Score = Number(localStorage.getItem('round2Score') || 0)
    const { totalSolved, isEligibleWinner } = getProgressState(flowchartSolvedRef.current, debugSolvedRef.current)

    const round3Score = totalSolved * POINTS_PER_SOLVED_PROBLEM
    const totalScore = round1Score + round2Score + round3Score
    const elapsedSeconds = getElapsedSecondsFromStart(startedAtRef.current, ROUND_DURATION)

    localStorage.setItem('round3Score', String(round3Score))
    localStorage.setItem('relicUnlocked', 'true')

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    try {
      if (user && user.teamName) {
        await submitRoundScore(user.teamName, 3, round3Score, totalSolved, [], elapsedSeconds)
      }
    } catch (error) {
      console.error('Error submitting score:', error)
      setStatusMessage('Score saved locally. Online submission failed.')
    }

    if (!hasReducedRef.current && reduceLamps) {
      hasReducedRef.current = true
      reduceLamps()
    }

    // Mark round as completed and clear the game session (all rounds done)
    markRoundCompleted(3)
    clearGameSession()

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

  const { isEligibleWinner } = getProgressState()

  return (
    <>
      <Background />
      <main
        className="event-container"
        onCopy={blockCopy}
        onCut={blockCopy}
        onContextMenu={blockCopy}
        style={{ userSelect: 'none' }}
      >
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
                  onClick={() => {
                    setActiveSection(option.key)
                    saveRoundState(3, {
                      flowchartSolvedCount: flowchartSolvedRef.current,
                      debugSolvedCount: debugSolvedRef.current,
                      activeSection: option.key,
                      timeLeft: timeLeftRef.current,
                      startedAt: startedAtRef.current
                    })
                  }}
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
                onClick={() => {
                  setActiveSection('flowchart')
                  saveRoundState(3, {
                    flowchartSolvedCount: flowchartSolvedRef.current,
                    debugSolvedCount: debugSolvedRef.current,
                    activeSection: 'flowchart',
                    timeLeft: timeLeftRef.current,
                    startedAt: startedAtRef.current
                  })
                }}
                disabled={isRoundLocked || activeSection === 'flowchart'}
              >
                Switch to Flowchart Challenges
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setActiveSection('debug')
                  saveRoundState(3, {
                    flowchartSolvedCount: flowchartSolvedRef.current,
                    debugSolvedCount: debugSolvedRef.current,
                    activeSection: 'debug',
                    timeLeft: timeLeftRef.current,
                    startedAt: startedAtRef.current
                  })
                }}
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
                onProgressChange={(payload) => {
                  flowchartSolvedRef.current = payload.solvedCount
                  setFlowchartSolvedCount(payload.solvedCount)

                  saveRoundState(3, {
                    flowchartSolvedCount: payload.solvedCount,
                    debugSolvedCount: debugSolvedRef.current,
                    activeSection,
                    timeLeft: timeLeftRef.current,
                    startedAt: startedAtRef.current
                  })
                }}
              />
            ) : (
              <DebugRound
                isRoundLocked={isRoundLocked}
                onProgressChange={(payload) => {
                  debugSolvedRef.current = payload.solvedCount
                  setDebugSolvedCount(payload.solvedCount)

                  saveRoundState(3, {
                    flowchartSolvedCount: flowchartSolvedRef.current,
                    debugSolvedCount: payload.solvedCount,
                    activeSection,
                    timeLeft: timeLeftRef.current,
                    startedAt: startedAtRef.current
                  })
                }}
              />
            )}
          </>
        )}

        <ResultMessage
          message={statusMessage}
          type={statusMessage === 'You have successfully decoded the relic. Victory lies within the code.' ? 'success' : 'info'}
          visible={!!statusMessage}
        />

        {isEligibleWinner && (
          <section className="round-actions" style={{ paddingTop: 0 }}>
            <button
              className="btn btn-golden"
              onClick={handleSubmitRound}
              disabled={isRoundLocked || submittedRef.current}
            >
              Submit Round 3
            </button>
          </section>
        )}

      </main>
    </>
  )
}
