import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import RoundHeader from '../components/RoundHeader'
import ScoreDisplay from '../components/ScoreDisplay'
import ActionButtons from '../components/ActionButtons'
import ResultMessage from '../components/ResultMessage'
import LampDisplay from '../components/LampDisplay'
import AllGames from './all-games/src/App'
import { submitRoundScore } from '../utils/api'
import { startTimer, autoSubmitRound, showResults } from '../utils/roundFlow'
import { saveRoundState, loadRoundState, markRoundCompleted, isRoundCompleted } from '../utils/sessionManager'

const ROUND_DURATION = 1200
const POINTS_PER_GAME = 10
const HINT_PENALTY = 5
const QUALIFICATION_SCORE = 10

const getElapsedSecondsFromStart = (startedAt, maxDurationSeconds) => {
  if (!Number.isFinite(startedAt)) return 0
  const elapsed = Math.floor((Date.now() - startedAt) / 1000)
  return Math.min(Math.max(elapsed, 0), maxDurationSeconds)
}

export default function Round2({ reduceLamps, lampsRemaining = 4 }) {
  const navigate = useNavigate()
  const round1Score = Number(localStorage.getItem('round1Score') || 0)
  const initialRoundStateRef = useRef(loadRoundState(2))
  const initialRoundState = initialRoundStateRef.current
  
  // Initialize state with saved values or defaults - load fresh on each mount
  const [completedGames, setCompletedGames] = useState(() => {
    console.log('Round2 - Loading saved state:', initialRoundState)
    return initialRoundState?.completedGames ?? 0
  })
  
  const [hintsPenalty, setHintsPenalty] = useState(() => {
    return initialRoundState?.hintsPenalty ?? 0
  })
  
  const [timeLeft, setTimeLeft] = useState(() => {
    return initialRoundState?.timeLeft ?? ROUND_DURATION
  })
  const timeLeftRef = useRef(initialRoundState?.timeLeft ?? ROUND_DURATION)
  
  const startedAtRef = useRef(initialRoundState?.startedAt ?? Date.now())
  
  const submittedRef = useRef(false)
  const completedGamesRef = useRef(initialRoundState?.completedGames ?? 0)
  const hintsPenaltyRef = useRef(initialRoundState?.hintsPenalty ?? 0)
  const currentGameIndexRef = useRef(
    Number.isInteger(initialRoundState?.currentGameIndex)
      ? initialRoundState.currentGameIndex
      : (initialRoundState?.completedGames ?? 0)
  )
  const currentGameRef = useRef(initialRoundState?.currentGame ?? null)
  const usedHintGamesRef = useRef(
    Array.isArray(initialRoundState?.usedHintGames)
      ? initialRoundState.usedHintGames
      : []
  )
  
  const [round2Score, setRound2Score] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isRoundLocked, setIsRoundLocked] = useState(false)
  const [resultMessage, setResultMessage] = useState('')
  const [lampsAfter, setLampsAfter] = useState(() => Number(localStorage.getItem('lampsRemaining') || lampsRemaining))
  const [hasReduced, setHasReduced] = useState(false)
  const blockCopy = (event) => event.preventDefault()

  const persistRoundState = () => {
    saveRoundState(2, {
      completedGames,
      hintsPenalty,
      timeLeft,
      currentGameIndex: currentGameIndexRef.current,
      currentGame: currentGameRef.current,
      usedHintGames: usedHintGamesRef.current,
      startedAt: startedAtRef.current
    })
  }

  // Check if round already completed on mount
  useEffect(() => {
    if (round1Score < QUALIFICATION_SCORE) {
      navigate('/results', {
        replace: true,
        state: {
          mode: 'round1',
          resultData: {
            score: round1Score,
            qualificationStatus: 'Not Qualified'
          }
        }
      })
      return
    }

    const existingScore = Number(localStorage.getItem('round2Score') || 0)
    
    if (isRoundCompleted(2) || existingScore > 0) {
      navigate('/round3', { replace: true })
    }
  }, [navigate, round1Score])

  // Save state immediately whenever progress changes
  useEffect(() => {
    if (isComplete || isRoundLocked) return

    persistRoundState()
  }, [completedGames, hintsPenalty, timeLeft, isComplete, isRoundLocked])

  // Ensure latest progress is flushed during tab hide/unload/sleep transitions
  useEffect(() => {
    if (isComplete || isRoundLocked) return

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
  }, [completedGames, hintsPenalty, timeLeft, isComplete, isRoundLocked])

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  useEffect(() => {
    // DEVELOPMENT MODE: Allow direct access without login
    if (isComplete || isRoundLocked) return

    const stopTimer = startTimer({
      duration: timeLeftRef.current,
      onTick: setTimeLeft,
      onTimeUp: handleTimeUp,
      isLocked: () => submittedRef.current || isRoundLocked || isComplete
    })

    return stopTimer
  }, [isComplete, isRoundLocked])

  useEffect(() => {
    if (isComplete || isRoundLocked) return

    const handlePopState = () => {
      if (!isComplete && !isRoundLocked) {
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
  }, [isComplete, isRoundLocked])

  const handleProgress = (count) => {
    completedGamesRef.current = count
    setCompletedGames(count)
    const score = Math.max((count * POINTS_PER_GAME) - hintsPenaltyRef.current, 0)
    setRound2Score(score)

    saveRoundState(2, {
      completedGames: count,
      hintsPenalty: hintsPenaltyRef.current,
      timeLeft: timeLeftRef.current,
      currentGameIndex: currentGameIndexRef.current,
      currentGame: currentGameRef.current,
      usedHintGames: usedHintGamesRef.current,
      startedAt: startedAtRef.current
    })
  }

  const handleAllGamesStateChange = (state) => {
    currentGameIndexRef.current = state.currentGameIndex
    currentGameRef.current = state.currentGame
    usedHintGamesRef.current = state.usedHintGames

    saveRoundState(2, {
      completedGames: state.completedGames,
      hintsPenalty: hintsPenaltyRef.current,
      timeLeft: timeLeftRef.current,
      currentGameIndex: state.currentGameIndex,
      currentGame: state.currentGame,
      usedHintGames: state.usedHintGames,
      startedAt: startedAtRef.current
    })
  }

  const handleTimeUp = () => {
    if (submittedRef.current) return

    setResultMessage('Time is up! Finalizing your Round 2 score...')
    autoSubmitRound({
      submittedRef,
      lockRound: () => setIsRoundLocked(true),
      submitRound: () => completeRound(completedGamesRef.current, true)
    })
  }

  const completeRound = async (completedCount, wasAutoSubmitted) => {
    setIsRoundLocked(true)

    const score = Math.max((completedCount * POINTS_PER_GAME) - hintsPenalty, 0)
    const questionsSolved = completedCount
    const elapsedSeconds = getElapsedSecondsFromStart(startedAtRef.current, ROUND_DURATION)
    const qualificationStatus = score >= QUALIFICATION_SCORE ? 'Qualified' : 'Not Qualified'

    setRound2Score(score)
    localStorage.setItem('round2Score', String(score))

    if (!hasReduced && reduceLamps) {
      const newLamps = 2
      setHasReduced(true)
      setLampsAfter(newLamps)
      localStorage.setItem('lampsRemaining', String(newLamps))
      reduceLamps()
    }

    // Mark round as completed in session
    markRoundCompleted(2)
    
    setIsComplete(true)

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    try {
      if (user && user.teamName) {
        await submitRoundScore(user.teamName, 2, score, questionsSolved, [], elapsedSeconds)
      }
    } catch (error) {
      console.error('Error submitting score:', error)
      setResultMessage('Score saved locally. Online submission failed.')
    }

    showResults({
      navigate,
      mode: 'round2',
      resultData: {
        score,
        timeTakenSeconds: elapsedSeconds,
        qualificationStatus,
        wasAutoSubmitted
      }
    })
  }

  const handleRound2Complete = (completedCount) => {
    if (submittedRef.current || isRoundLocked || isComplete) return

    autoSubmitRound({
      submittedRef,
      lockRound: () => setIsRoundLocked(true),
      submitRound: () => completeRound(completedCount || 0, false)
    })
  }

  const totalScore = round1Score + round2Score

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
          roundTitle="ROUND 2"
          subtitle=""
          lampsRemaining={null}
          timeLeft={timeLeft}
          showTimer={!isComplete}
        />

        {!isComplete ? (
          <>
            <div className={isRoundLocked ? 'interaction-locked' : ''}>
              <AllGames
                sequentialMode={true}
                onRoundComplete={handleRound2Complete}
                onProgress={handleProgress}
                initialProgressState={{
                  completedGames,
                  currentGameIndex: Number.isInteger(initialRoundState?.currentGameIndex)
                    ? initialRoundState.currentGameIndex
                    : completedGames,
                  currentGame: initialRoundState?.currentGame,
                  usedHintGames: Array.isArray(initialRoundState?.usedHintGames)
                    ? initialRoundState.usedHintGames
                    : []
                }}
                onStateChange={handleAllGamesStateChange}
                onHintUsed={() => {
                  if (isRoundLocked || submittedRef.current) return

                  setHintsPenalty(prevPenalty => {
                    const newPenalty = prevPenalty + HINT_PENALTY
                    hintsPenaltyRef.current = newPenalty
                    const newScore = Math.max((completedGamesRef.current * POINTS_PER_GAME) - newPenalty, 0)
                    setRound2Score(newScore)

                    saveRoundState(2, {
                      completedGames: completedGamesRef.current,
                      hintsPenalty: newPenalty,
                      timeLeft: timeLeftRef.current,
                      currentGameIndex: currentGameIndexRef.current,
                      currentGame: currentGameRef.current,
                      usedHintGames: usedHintGamesRef.current,
                      startedAt: startedAtRef.current
                    })

                    return newPenalty
                  })
                }}
              />
            </div>

            <ResultMessage message={resultMessage} type="info" visible={!!resultMessage} />
          </>
        ) : (
          <section className="round-complete">
            <LampDisplay lampsRemaining={lampsAfter} showMessage={false} />
            <ScoreDisplay
              scores={[
                { label: 'Round 1 Score', value: round1Score },
                { label: 'Round 2 Score', value: round2Score },
                { label: 'Total Score', value: totalScore, isTotal: true }
              ]}
              showTotal={false}
            />
            <ActionButtons
              buttons={[
                { label: 'Proceed to Round 3', variant: 'btn-golden', onClick: () => navigate('/round3') }
              ]}
            />
          </section>
        )}
      </main>
    </>
  )
}
