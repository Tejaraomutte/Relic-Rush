import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import { formatTime, submitRoundScore } from '../utils/api'

const questions = [
    {
        question: "I have cities but no houses, mountains but no trees, and water but no fish. What am I?",
        clue: "You unfold me to find places.",
        answer: "map"
    },
    {
        question: "I speak without a mouth and hear without ears. I have nobody, but I come alive with wind. What am I?",
        clue: "You often hear me in canyons or empty rooms.",
        answer: "echo"
    },
    {
        question: "I have keys but no locks. I have space but no rooms. You can enter but can't go outside. What am I?",
        clue: "You press me to write or play music (two interpretations).",
        answer: "keyboard"
    },
    {
        question: "The more of this there is, the less you see. What is it?",
        clue: "It fills the night sky sometimes.",
        answer: "darkness"
    },
    {
        question: "I am not alive but I grow; I don't have lungs but I need air; I don't have a mouth but water kills me. What am I?",
        clue: "You might see me in a camp or under a lamp.",
        answer: "fire"
    }
]

const ROUND_NUMBER = 2
const ROUND_DURATION = 300

export default function Round2() {
  const navigate = useNavigate()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [clueUsed, setClueUsed] = useState(new Array(questions.length).fill(false))
  const [score, setScore] = useState(0)
  const [answerInput, setAnswerInput] = useState('')
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION)
  const [timerId, setTimerId] = useState(null)
  const [resultMessage, setResultMessage] = useState('')
  const [resultType, setResultType] = useState('')
  const [submitDisabled, setSubmitDisabled] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      navigate('/login')
      return
    }

    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    setTimerId(id)
    return () => clearInterval(id)
  }, [navigate])

  const onTimeUp = async () => {
    flashResult('⏱️ Time is up! Finishing round...', 'info')
    await new Promise(r => setTimeout(r, 900))
    await finishRound()
  }

  const handleLoadQuestion = (index) => {
    setCurrentQuestionIndex(index)
    setAnswerInput('')
  }

  const handleRevealClue = () => {
    const newClueUsed = [...clueUsed]
    newClueUsed[currentQuestionIndex] = true
    setClueUsed(newClueUsed)
    setScore(Math.max(0, score - 5))
  }

  const handleSubmitAnswer = async () => {
    const userAnswer = answerInput.trim().toLowerCase()
    if (!userAnswer) {
      flashResult('Please enter an answer', 'error')
      return
    }

    const correct = questions[currentQuestionIndex].answer.toLowerCase()
    if (userAnswer === correct) {
      setScore(prev => prev + 10)
      flashResult('Correct! +10', 'success')
    } else {
      flashResult('Incorrect. No points awarded', 'info')
    }

    setSubmitDisabled(true)
    await new Promise(r => setTimeout(r, 800))
    setSubmitDisabled(false)

    if (currentQuestionIndex === questions.length - 1) {
      setScore(prev => Math.max(0, prev))
      await finishRound()
    } else {
      handleLoadQuestion(currentQuestionIndex + 1)
    }
  }

  const finishRound = async () => {
    if (timerId) clearInterval(timerId)

    const finalScore = Math.max(0, score)
    localStorage.setItem('round2Score', finalScore.toString())

    const lampsRemaining = parseInt(localStorage.getItem('lampsRemaining')) || 4
    const newLamps = Math.max(1, lampsRemaining - 1)
    localStorage.setItem('lampsRemaining', newLamps.toString())

    const user = JSON.parse(localStorage.getItem('user')) || { email: '' }
    try {
      await submitRoundScore(user.email, ROUND_NUMBER, finalScore)
    } catch (error) {
      console.error('Error submitting score:', error)
    }

    setResultMessage(`Round 2 Complete\nYour Score: ${finalScore}\nProceeding to Round 3...`)
    setResultType('success')
    
    setTimeout(() => navigate('/round3'), 1600)
  }

  const flashResult = (msg, type) => {
    setResultMessage(msg)
    setResultType(type)
    setTimeout(() => {
      setResultMessage('')
    }, 1200)
  }

  const handleGoBack = () => {
    if (confirm('Are you sure you want to go back? Your progress will be lost.')) {
      navigate('/')
    }
  }

  const question = questions[currentQuestionIndex]
  const timerClass = timeLeft <= 10 ? 'danger' : timeLeft <= 30 ? 'warning' : ''
  const lampsRemaining = localStorage.getItem('lampsRemaining') || '4'
  const clueShown = clueUsed[currentQuestionIndex]

  return (
    <>
      <Background />
      <main className="event-container">
        <header className="round-header">
          <div className="header-top">
            <h1 className="round-title">ROUND 2</h1>
            <div className="lamps-indicator">{lampsRemaining} Lamps Remaining</div>
          </div>
          <div className="timer-section">
            <span className="timer-label">Time Remaining:</span>
            <span className={`timer-display ${timerClass}`}>{formatTime(timeLeft)}</span>
          </div>
        </header>

        <div className="quiz-container">
          <div className="puzzle-display">
            <h2 className="question-text">Puzzle {currentQuestionIndex + 1}: {question.question}</h2>

            {clueShown && (
              <div className="clue-area visible">
                {question.clue}
              </div>
            )}

            <input
              type="text"
              className="answer-input"
              placeholder="Type your answer here..."
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !submitDisabled && handleSubmitAnswer()}
            />
          </div>
        </div>

        <div className="round-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleGoBack}
          >
            ← Go Back
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleRevealClue}
            disabled={clueShown}
            style={{ opacity: clueShown ? 0.5 : 1 }}
          >
            💡 Reveal Clue (-5 pts)
          </button>
          <button 
            className="btn btn-golden" 
            onClick={handleSubmitAnswer}
            disabled={submitDisabled}
          >
            Submit Answer →
          </button>
        </div>

        {resultMessage && (
          <div className={`result-message ${resultType}`} style={{ display: 'block' }}>
            {resultMessage}
          </div>
        )}
      </main>
    </>
  )
}
