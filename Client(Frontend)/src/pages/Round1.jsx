import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import { formatTime, submitRoundScore } from '../utils/api'

const questions = [
  {
    question: "Find the intruder",
    questionImage: "/assets/images/q1.webp",
    options: [
      { text: "1", image: null },
      { text: "2", image: null },
      { text: "3", image: null },
      { text: "4", image: null },
      { text: "5", image: null }
    ],
    correct: 1
  },
  {
    question: "A directed graph has four nodes: A, B, C, and D. The edges and their weights are: A -> B (weight 2), A -> C (weight 5), B -> C (weight 1), B -> D (weight 4), C -> D (weight 1). What is the weight of the shortest path from A to D?",
    questionImage: "/assets/images/q2.jpg",
    options: [
      { text: "7", image: null },
      { text: "4", image: null },
      { text: "6", image: null },
      { text: "5", image: null }
    ],
    correct: 2
  },
  {
    question: "Solve this number visual riddle",
    questionImage: "/assets/images/q3.webp",
    options: [
      { text: "4", image: null },
      { text: "6", image: null },
      { text: "8", image: null },
      { text: "10", image: null }
    ],
    correct: 2
  },
  {
    question: "Solve this question",
    questionImage: "/assets/images/q4.webp",
    options: [
      { text: "12", image: null },
      { text: "13", image: null },
      { text: "14", image: null },
      { text: "15", image: null }
    ],
    correct: 1
  },
  {
    question: "Find the figure from the option, that will replace the question mark (?) from the problem figure.",
    questionImage: "/assets/images/q5.png",
    options: [
      { text: null, image: "/assets/images/q5-1.png" },
      { text: null, image: "/assets/images/q5-2.png" },
      { text: null, image: "/assets/images/q5-3.png" },
      { text: null, image: "/assets/images/q5-4.png" }
    ],
    correct: 0
  }
]

const ROUND_NUMBER = 1
const ROUND_DURATION = 300

export default function Round1() {
  const navigate = useNavigate()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState(new Array(questions.length).fill(null))
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION)
  const [timerId, setTimerId] = useState(null)
  const [resultMessage, setResultMessage] = useState('')
  const [resultType, setResultType] = useState('')

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
    showResultMessage('⏱️ Time is up! Submitting your answers...', 'info')
    await new Promise(r => setTimeout(r, 1000))
    await calculateAndSubmitRound(selectedAnswers)
  }

  const handleSelectOption = (optionIndex) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = optionIndex
    setSelectedAnswers(newAnswers)
  }

  const handleSubmitQuestion = async () => {
    if (selectedAnswers[currentQuestionIndex] === null) {
      showResultMessage('Please select an answer before submitting', 'error')
      return
    }

    if (currentQuestionIndex === questions.length - 1) {
      await calculateAndSubmitRound(selectedAnswers)
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const calculateAndSubmitRound = async (answers) => {
    if (timerId) clearInterval(timerId)

    let score = 0
    answers.forEach((answer, index) => {
      if (answer === questions[index].correct) {
        score++
      }
    })

    localStorage.setItem('round1Score', score.toString())

    const lampsRemaining = parseInt(localStorage.getItem('lampsRemaining')) || 4
    const newLampsRemaining = Math.max(lampsRemaining - 1, 1)
    localStorage.setItem('lampsRemaining', newLampsRemaining.toString())

    const user = JSON.parse(localStorage.getItem('user'))
    try {
      await submitRoundScore(user.email, ROUND_NUMBER, score)
    } catch (error) {
      console.error('Error submitting score:', error)
    }

    setResultMessage(`🎉 Round 1 Completed!\nYour Score: ${score} / ${questions.length}\nProceeding to Round 2...`)
    setResultType('success')

    setTimeout(() => {
      navigate('/round2')
    }, 2000)
  }

  const showResultMessage = (message, type) => {
    setResultMessage(message)
    setResultType(type)
    setTimeout(() => {
      setResultMessage('')
    }, 3000)
  }

  const handleGoBack = () => {
    if (window.confirm('Are you sure you want to go back? Your progress will be lost.')) {
      navigate('/')
    }
  }

  const question = questions[currentQuestionIndex]
  const timerClass = timeLeft <= 10 ? 'danger' : timeLeft <= 30 ? 'warning' : ''
  const lampsRemaining = localStorage.getItem('lampsRemaining') || '4'

  return (
    <>
      <Background />
      <main className="event-container">
        <header className="round-header">
          <div className="header-top">
            <h1 className="round-title">ROUND 1</h1>
            <div className="lamps-indicator">{lampsRemaining} Lamps Remaining</div>
          </div>
          <div className="timer-section">
            <span className="timer-label">Time Remaining:</span>
            <span className={`timer-display ${timerClass}`}>{formatTime(timeLeft)}</span>
          </div>
        </header>

        <div className="quiz-container">
          <div className="question-display">
            <h2 className="question-text">Q{currentQuestionIndex + 1}. {question.question}</h2>

            {question.questionImage && (
              <div className="question-image-wrapper">
                <img src={question.questionImage} alt="Question" className="question-image" />
              </div>
            )}

            <div className="options-grid">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`option-card ${selectedAnswers[currentQuestionIndex] === index ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(index)}
                >
                  {option.text && <p>{option.text}</p>}
                  {option.image && <img src={option.image} alt={`Option ${index + 1}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="round-actions">
          <button className="btn btn-secondary" onClick={handleGoBack}>← Go Home</button>
          <button className="btn btn-golden" onClick={handleSubmitQuestion}>
            {currentQuestionIndex === questions.length - 1 ? 'Submit All Answers →' : 'Next Question →'}
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
