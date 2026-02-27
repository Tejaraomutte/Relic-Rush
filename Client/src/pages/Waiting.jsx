import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import './Waiting.css'

export default function Waiting() {
  const navigate = useNavigate()
  const location = useLocation()

  const mode = location.state?.mode || 'final'
  const resultData = location.state?.resultData || null

  const handleNext = () => {
    navigate('/results', {
      state: {
        mode,
        resultData
      },
      replace: true
    })
  }

  return (
    <>
      <Background />
      <main className="event-container waiting-page">
        <section className="waiting-card">
          <h1 className="event-title waiting-title">Submission Received</h1>
          <p className="event-subtitle waiting-subtitle">
            Please wait while other players complete this round.
          </p>
          <p className="event-description waiting-description">
            Click Next when you are ready to view your round result.
          </p>

          <button className="btn btn-golden waiting-next-btn" onClick={handleNext}>
            Next
          </button>
        </section>
      </main>
    </>
  )
}