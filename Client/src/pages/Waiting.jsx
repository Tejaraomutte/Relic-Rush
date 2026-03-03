import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import { submitRoundScore } from '../utils/api'
import './Waiting.css'

export default function Waiting() {
  const navigate = useNavigate()
  const location = useLocation()

  const restoredWaitingState = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('waitingState')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [])

  const mode = location.state?.mode || restoredWaitingState?.mode || 'final'
  const resultData = location.state?.resultData || restoredWaitingState?.resultData || null
  const submissionPayload = resultData?.submissionPayload || null
  const totalRoundSeconds = Number(submissionPayload?.totalRoundTimeSeconds || 0)
  const actualTakenSeconds = Number(submissionPayload?.actualTimeTakenSeconds || resultData?.timeTakenSeconds || 0)
  const boundedActualSeconds = Math.max(0, Math.min(actualTakenSeconds, totalRoundSeconds || actualTakenSeconds))
  const initialRemainingSeconds = Math.max(totalRoundSeconds - boundedActualSeconds, 0)

  const [remainingSeconds, setRemainingSeconds] = useState(initialRemainingSeconds)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitDone, setSubmitDone] = useState(false)

  const unlockKey = useMemo(() => {
    if (!submissionPayload) return ''
    const safeTeam = String(submissionPayload.teamName || 'team').replace(/[^a-zA-Z0-9_-]/g, '_')
    const safeRound = String(submissionPayload.roundNumber || mode)
    return `waitingUnlockTs:${safeTeam}:${safeRound}`
  }, [submissionPayload, mode])

  const submitDoneKey = useMemo(() => {
    if (!submissionPayload) return ''
    const safeTeam = String(submissionPayload.teamName || 'team').replace(/[^a-zA-Z0-9_-]/g, '_')
    const safeRound = String(submissionPayload.roundNumber || mode)
    return `waitingSubmitDone:${safeTeam}:${safeRound}`
  }, [submissionPayload, mode])

  useEffect(() => {
    if (!resultData) return

    sessionStorage.setItem('waitingState', JSON.stringify({ mode, resultData }))
  }, [mode, resultData])

  useEffect(() => {
    if (!submissionPayload || !unlockKey) {
      setRemainingSeconds(0)
      return
    }

    const now = Date.now()
    const existingUnlockTs = Number(sessionStorage.getItem(unlockKey) || 0)
    const unlockTs = Number.isFinite(existingUnlockTs) && existingUnlockTs > 0
      ? existingUnlockTs
      : now + initialRemainingSeconds * 1000

    if (!existingUnlockTs) {
      sessionStorage.setItem(unlockKey, String(unlockTs))
    }

    const tick = () => {
      const seconds = Math.max(Math.ceil((unlockTs - Date.now()) / 1000), 0)
      setRemainingSeconds(seconds)
    }

    tick()
    const timerId = window.setInterval(tick, 250)
    return () => window.clearInterval(timerId)
  }, [submissionPayload, unlockKey, initialRemainingSeconds])

  useEffect(() => {
    if (!submitDoneKey) return

    const wasSubmitted = sessionStorage.getItem(submitDoneKey) === 'true'
    if (wasSubmitted) {
      setSubmitDone(true)
    }
  }, [submitDoneKey])

  const formatClock = (seconds) => {
    const safeSeconds = Math.max(Number(seconds) || 0, 0)
    const mins = Math.floor(safeSeconds / 60)
    const secs = safeSeconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const parseConflictAsAlreadySubmitted = (message, submittedRound) => {
    try {
      const text = String(message || '')
      const jsonStart = text.indexOf('{')
      if (jsonStart < 0) return false

      const payload = JSON.parse(text.slice(jsonStart))
      const expectedRound = Number(payload?.expectedRound)
      const normalizedSubmittedRound = Number(submittedRound)

      if (!Number.isFinite(expectedRound) || !Number.isFinite(normalizedSubmittedRound)) {
        return false
      }

      return expectedRound > normalizedSubmittedRound
    } catch {
      return false
    }
  }

  const performSubmission = async () => {
    if (!submissionPayload || submitDone || isSubmitting) {
      return
    }

    setSubmitError('')

    try {
      setIsSubmitting(true)

      await submitRoundScore(
        submissionPayload.teamName,
        submissionPayload.roundNumber,
        submissionPayload.roundScore,
        submissionPayload.questionsSolved,
        submissionPayload.questionTimes || [],
        submissionPayload.actualTimeTakenSeconds,
        {
          totalRoundTimeAllowed: submissionPayload.totalRoundTimeSeconds
        }
      )

      const numericRound = Number(submissionPayload.roundNumber)
      if (numericRound === 1) {
        localStorage.setItem('currentRound', '2')
      } else if (numericRound === 2) {
        localStorage.setItem('currentRound', '3')
      } else if (numericRound === 3) {
        localStorage.setItem('currentRound', '3')
      }

      if (submitDoneKey) {
        sessionStorage.setItem(submitDoneKey, 'true')
      }
      setSubmitDone(true)
    } catch (error) {
      const treatedAsAlreadySubmitted = parseConflictAsAlreadySubmitted(
        error?.message,
        submissionPayload?.roundNumber
      )

      if (treatedAsAlreadySubmitted) {
        const numericRound = Number(submissionPayload.roundNumber)
        if (numericRound === 1) {
          localStorage.setItem('currentRound', '2')
        } else if (numericRound === 2) {
          localStorage.setItem('currentRound', '3')
        } else if (numericRound === 3) {
          localStorage.setItem('currentRound', '3')
        }

        if (submitDoneKey) {
          sessionStorage.setItem(submitDoneKey, 'true')
        }
        setSubmitDone(true)
        return
      }

      setSubmitError(error.message || 'Failed to submit round. Please retry.')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!submissionPayload || submitDone) return

    performSubmission()
  }, [submissionPayload, submitDone])

  const handleSubmit = async () => {
    if (submissionPayload && (remainingSeconds > 0 || !submitDone || isSubmitting)) {
      return
    }

    if (unlockKey) {
      sessionStorage.removeItem(unlockKey)
    }
    if (submitDoneKey) {
      sessionStorage.removeItem(submitDoneKey)
    }
    sessionStorage.removeItem('waitingState')

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

          {submissionPayload ? (
            <>
              <p className="event-description waiting-description">
                You completed in {formatClock(boundedActualSeconds)}.
              </p>
              <p className="event-description waiting-description waiting-countdown">
                Remaining Time: {formatClock(remainingSeconds)}
              </p>
              <p className="event-description waiting-description">
                Result view unlocks when the full round time completes.
              </p>
            </>
          ) : (
            <p className="event-description waiting-description">
              Click Next when you are ready to view your round result.
            </p>
          )}

          {submitError && (
            <p className="event-description waiting-error">{submitError}</p>
          )}

          <button
            className="btn btn-golden waiting-next-btn"
            onClick={handleSubmit}
            disabled={isSubmitting || (submissionPayload && (remainingSeconds > 0 || !submitDone))}
          >
            {submissionPayload ? (isSubmitting ? 'Submitting...' : 'View Result') : 'Next'}
          </button>

          {submissionPayload && submitError && !isSubmitting && !submitDone && (
            <button
              className="btn btn-secondary waiting-next-btn"
              onClick={performSubmission}
            >
              Retry Submit
            </button>
          )}
        </section>
      </main>
    </>
  )
}