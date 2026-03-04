import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import RoundHeader from '../components/RoundHeader'
import ActionButtons from '../components/ActionButtons'
import ResultMessage from '../components/ResultMessage'
import { startTimer, autoSubmitRound, showResults } from '../utils/roundFlow'
import FlowBuilder from './flowchart/src/pages/FlowBuilder'
import DebugRound from './flowchart/src/debug/DebugRound'
import { getRoundStatus } from '../utils/api'
import { saveRoundState, loadRoundState, markRoundCompleted, isRoundCompleted, clearGameSession } from '../utils/sessionManager'
import { getRoundRemainingSeconds, getRoundStartConfig, setRoundStartConfig } from '../utils/roundGate'

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
  const initialRoundStartState = getRoundStartConfig(3)
  const initialRoundDuration = Number(initialRoundStartState?.durationSeconds || ROUND_DURATION)
  const initialRoundStateRef = useRef(loadRoundState(3))
  const initialRoundState = initialRoundStateRef.current
  
  // Initialize state with saved values or defaults - load fresh on each mount
  const [activeSection, setActiveSection] = useState(() => {
    console.log('Round3 - Loading saved state:', initialRoundState)
    return initialRoundState?.activeSection ?? null
  })
  
  const [timeLeft, setTimeLeft] = useState(() => {
    if (Number.isFinite(initialRoundState?.timeLeft)) {
      return initialRoundState.timeLeft
    }

    return getRoundRemainingSeconds(3, initialRoundDuration)
  })

  const startedAtRef = useRef(
    initialRoundState?.startedAt ?? Number(initialRoundStartState?.startedAtMs || Date.now())
  )
  const [roundDurationSeconds, setRoundDurationSeconds] = useState(initialRoundDuration)
  const [roundAccessLoading, setRoundAccessLoading] = useState(true)
  
  const timeLeftRef = useRef(
    Number.isFinite(initialRoundState?.timeLeft)
      ? initialRoundState.timeLeft
      : getRoundRemainingSeconds(3, initialRoundDuration)
  )
  
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

  // Route access by currentRound only (crash recovery safe)
  useEffect(() => {
    let isMounted = true

    const ensureAccess = async () => {
      const assignedRound = Number(localStorage.getItem('currentRound') || 1)
      if (assignedRound === 1) {
        navigate('/round1', { replace: true })
        return
      }

      if (assignedRound === 2) {
        navigate('/round2', { replace: true })
        return
      }

      const token = sessionStorage.getItem('token')
      if (!token) {
        setRoundAccessLoading(false)
        return
      }

      try {
        const response = await getRoundStatus(token, 3)
        if (!isMounted) return

        if (response?.round?.isActive) {
          setRoundStartConfig(response.round)

          const duration = Number(response.round.durationSeconds || ROUND_DURATION)
          const remaining = Math.max(Number(response.round.timeRemainingSeconds || 0), 0)

          setRoundDurationSeconds(duration)
          setTimeLeft(remaining)
          timeLeftRef.current = remaining
          startedAtRef.current = response?.round?.startedAt
            ? new Date(response.round.startedAt).getTime()
            : Date.now()

          setRoundAccessLoading(false)
          return
        }

        navigate('/waiting', {
          replace: true,
          state: {
            mode: 'await-round-start',
            targetRound: 3
          }
        })
      } catch {
        navigate('/waiting', {
          replace: true,
          state: {
            mode: 'await-round-start',
            targetRound: 3
          }
        })
      }
    }

    ensureAccess()

    return () => {
      isMounted = false
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
    if (roundAccessLoading || isRoundLocked) return

    const stopTimer = startTimer({
      duration: timeLeftRef.current,
      onTick: setTimeLeft,
      onTimeUp: handleTimeUp,
      isLocked: () => submittedRef.current || isRoundLocked
    })

    return stopTimer
  }, [isRoundLocked, roundAccessLoading])

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
    const canSubmitRound = flowSolved >= 2 && debugSolved >= 2

    return {
      flowSolved,
      debugSolved,
      totalSolved,
      canSubmitRound
    }
  }

  const finalizeRound = async (wasAutoSubmitted) => {
    const round1Score = Number(localStorage.getItem('round1Score') || 0)
    const round2Score = Number(localStorage.getItem('round2Score') || 0)
    const { totalSolved, canSubmitRound } = getProgressState(flowchartSolvedRef.current, debugSolvedRef.current)
    const answeredCount = Math.max(0, Number(totalSolved) || 0)

    const round3Score = answeredCount * POINTS_PER_SOLVED_PROBLEM
    const totalScore = round1Score + round2Score + round3Score
    const elapsedSeconds = getElapsedSecondsFromStart(startedAtRef.current, roundDurationSeconds)

    localStorage.setItem('round3Score', String(round3Score))
    localStorage.setItem('relicUnlocked', 'true')

    const user = JSON.parse(sessionStorage.getItem('user') || '{}')

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
        qualificationStatus: canSubmitRound ? 'Qualified' : 'Not Qualified',
        wasAutoSubmitted,
        isWinner: canSubmitRound,
        submissionPayload: {
          roundNumber: 3,
          teamName: user?.teamName || '',
          roundScore: round3Score,
          questionsSolved: answeredCount,
          questionTimes: [],
          actualTimeTakenSeconds: elapsedSeconds,
          totalRoundTimeSeconds: roundDurationSeconds
        }
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

    const { canSubmitRound, flowSolved, debugSolved } = getProgressState()

    if (!canSubmitRound) {
      setStatusMessage(`Solve at least 2 Flowchart and 2 Debug challenges before final submission. Current: Flowchart ${flowSolved}/2, Debug ${debugSolved}/2.`)
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

  const { canSubmitRound } = getProgressState()

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
          subtitle="Complete at least 2 Flowchart and 2 Debug challenges before final submission."
          lampsRemaining={null}
          timeLeft={timeLeft}
          showTimer={!roundAccessLoading}
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

        {canSubmitRound && (
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
