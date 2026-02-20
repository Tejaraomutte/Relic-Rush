import React from 'react'
import { useNavigate } from 'react-router-dom'
import AllGames from './all-games/src/App'

export default function Round2() {
  const navigate = useNavigate()

  const handleRound2Complete = (score) => {
    localStorage.setItem('round2Score', String(score || 0))
    navigate('/results')
  }

  return <AllGames sequentialMode={true} onRoundComplete={handleRound2Complete} />
}
