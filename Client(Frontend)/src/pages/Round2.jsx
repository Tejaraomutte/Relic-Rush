import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import RoundHeader from '../components/RoundHeader'
import ScoreDisplay from '../components/ScoreDisplay'
import ActionButtons from '../components/ActionButtons'
import ResultMessage from '../components/ResultMessage'
import LampDisplay from '../components/LampDisplay'
import AllGames from './all-games/src/App'

const ROUND_DURATION = 1200
const POINTS_PER_GAME = 5

export default function Round2({ reduceLamps, lampsRemaining = 4 }) {
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION)
  const [completedGames, setCompletedGames] = useState(0)
  const [round2Score, setRound2Score] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [resultMessage, setResultMessage] = useState('')
  const [lampsAfter, setLampsAfter] = useState(lampsRemaining)
  const [hasReduced, setHasReduced] = useState(false)

  const round1Score = Number(localStorage.getItem('round1Score') || 0)

  useEffect(() => {
    if (isComplete) return

    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(id)
  }, [isComplete])

  const handleProgress = (count) => {
    setCompletedGames(count)
    setRound2Score(count * POINTS_PER_GAME)
  }

  const handleTimeUp = () => {
    setResultMessage('Time is up! Finalizing your Round 2 score...')
    completeRound(completedGames)
  }

  const completeRound = (completedCount) => {
    const score = completedCount * POINTS_PER_GAME
    setRound2Score(score)
    localStorage.setItem('round2Score', String(score))

    if (!hasReduced && reduceLamps) {
      setHasReduced(true)
      setLampsAfter(Math.max(lampsRemaining - 1, 1))
      reduceLamps()
    }

    setIsComplete(true)
  }

  const handleRound2Complete = (completedCount) => {
    completeRound(completedCount || 0)
  }

  const totalScore = round1Score + round2Score

  return (
    <>
      <Background />
      <main className="event-container">
        <RoundHeader
          roundTitle="ROUND 2"
          subtitle="Conquer the puzzles - 5 points each"
          lampsRemaining={lampsRemaining}
          timeLeft={timeLeft}
          showTimer={!isComplete}
        />

        {!isComplete ? (
          <>
            <AllGames
              sequentialMode={true}
              onRoundComplete={handleRound2Complete}
              onProgress={handleProgress}
            />

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
