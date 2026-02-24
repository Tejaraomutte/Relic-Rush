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

const ROUND_DURATION = 1200
const POINTS_PER_GAME = 10
const HINT_PENALTY = 5
const QUALIFICATION_SCORE = 10

export default function Round2({ reduceLamps, lampsRemaining = 4 }) {
  const navigate = useNavigate()
  const startedAtRef = useRef(Date.now())
  const submittedRef = useRef(false)
  const completedGamesRef = useRef(0)
  const hintsPenaltyRef = useRef(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION)
  const [completedGames, setCompletedGames] = useState(0)
  const [round2Score, setRound2Score] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isRoundLocked, setIsRoundLocked] = useState(false)
  const [resultMessage, setResultMessage] = useState('')
  const [lampsAfter, setLampsAfter] = useState(() => Number(localStorage.getItem('lampsRemaining') || lampsRemaining))
  const [hasReduced, setHasReduced] = useState(false)
  const [hintsPenalty, setHintsPenalty] = useState(0)
  const blockCopy = (event) => event.preventDefault()

  useEffect(() => {
    const existingScore = Number(localStorage.getItem('round2Score') || 0)
    if (existingScore > 0) {
      navigate('/results', {
        state: {
          mode: 'round2',
          resultData: { score: existingScore, timeTakenSeconds: null }
        }
      })
    }
  }, [navigate])

  const round1Score = Number(localStorage.getItem('round1Score') || 0)

  useEffect(() => {
    // DEVELOPMENT MODE: Allow direct access without login
    if (isComplete || isRoundLocked) return

    const stopTimer = startTimer({
      duration: ROUND_DURATION,
      onTick: setTimeLeft,
      onTimeUp: handleTimeUp,
      isLocked: () => submittedRef.current || isRoundLocked || isComplete
    })

    return stopTimer
  }, [isComplete, isRoundLocked])

  useEffect(() => {
    if (isComplete || isRoundLocked) return

    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }

    const handlePopState = () => {
      if (!isComplete && !isRoundLocked) {
        window.history.pushState(null, '', window.location.href)
      }
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('beforeunload', handleBeforeUnload)
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
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isComplete, isRoundLocked])

  const handleProgress = (count) => {
    completedGamesRef.current = count
    setCompletedGames(count)
    const score = Math.max((count * POINTS_PER_GAME) - hintsPenaltyRef.current, 0)
    setRound2Score(score)
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
    const elapsedSeconds = Math.min(
      Math.max(Math.round((Date.now() - startedAtRef.current) / 1000), 0),
      ROUND_DURATION
    )
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
                onHintUsed={() => {
                  if (isRoundLocked || submittedRef.current) return

                  setHintsPenalty(prevPenalty => {
                    const newPenalty = prevPenalty + HINT_PENALTY
                    hintsPenaltyRef.current = newPenalty
                    const newScore = Math.max((completedGamesRef.current * POINTS_PER_GAME) - newPenalty, 0)
                    setRound2Score(newScore)
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
