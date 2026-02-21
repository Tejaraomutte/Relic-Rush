import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import RoundHeader from '../components/RoundHeader'
import QuestionCard from '../components/QuestionCard'
import ScoreDisplay from '../components/ScoreDisplay'
import ActionButtons from '../components/ActionButtons'

export default function Round3({ lampsRemaining = 2 }) {
  const navigate = useNavigate()
  const round1Score = Number(localStorage.getItem('round1Score') || 0)
  const round2Score = Number(localStorage.getItem('round2Score') || 0)
  const totalScore = round1Score + round2Score
  const timeLeft = 0

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      navigate('/login')
    }
  }, [navigate])

  return (
    <>
      <Background />
      <main className="event-container">
        <RoundHeader 
          roundTitle="ROUND 3"
          subtitle="The Ultimate Challenge Awaits"
          lampsRemaining={lampsRemaining}
          timeLeft={timeLeft}
          showTimer={true}
        />
        <ScoreDisplay
          scores={[
            { label: 'Round 1 Score', value: round1Score },
            { label: 'Round 2 Score', value: round2Score },
            { label: 'Total Score', value: totalScore, isTotal: true }
          ]}
          showTotal={false}
        />

        <div className="quiz-container">
          <QuestionCard questionText="Round 3 Questions Coming Soon">
            <div className="placeholder-card">
              <p className="placeholder-text">
                The final mysteries of the ancient temple await. Legendary puzzles will be added here soon.
              </p>
              <p className="placeholder-text secondary">
                Prepare for the ultimate challenge.
              </p>
            </div>
          </QuestionCard>
        </div>

        <ActionButtons
          buttons={[
            { label: 'Return to Home', variant: 'btn-golden', onClick: () => navigate('/home') }
          ]}
        />
      </main>
    </>
  )
}
