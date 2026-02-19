import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import { formatTime, submitRoundScore } from '../utils/api'

const questions = [
  {
    question: "What does HTML stand for?",
    questionImage: "/assets/images/q11.jpg",
    options: [
      { text: "HyperText Markup Language", image: null },
      { text: "High Tech Modern Language", image: null },
      { text: "Home Tool Markup Language", image: null },
      { text: "Hyperlinks and Text Markup Language", image: null }
    ],
    correct: 0
  },
  {
    question: "Which sorting algorithm has the best average time complexity?",
    questionImage: "/assets/images/q12.jpg",
    options: [
      { text: "Bubble Sort", image: null },
      { text: "Quick Sort", image: null },
      { text: "Insertion Sort", image: null },
      { text: "Selection Sort", image: null }
    ],
    correct: 1
  },
  {
    question: "What does API stand for?",
    questionImage: "/assets/images/q13.jpg",
    options: [
      { text: "Application Programming Interface", image: null },
      { text: "Applied Programming Interface", image: null },
      { text: "Application Process Interface", image: null },
      { text: "Advanced Programming Interface", image: null }
    ],
    correct: 0
  },
  {
    question: "Which data structure uses LIFO principle?",
    questionImage: "/assets/images/q14.jpg",
    options: [
      { text: "Queue", image: null },
      { text: "Stack", image: null },
      { text: "Tree", image: null },
      { text: "Graph", image: null }
    ],
    correct: 1
  },
  {
    question: "What is the primary purpose of version control?",
    questionImage: "/assets/images/q15.jpg",
    options: [
      { text: "Track changes and manage code history", image: null },
      { text: "Encrypt code files", image: null },
      { text: "Compress code files", image: null },
      { text: "Optimize code performance", image: null }
    ],
    correct: 0
  }
]

const ROUND_NUMBER = 3
const ROUND_DURATION = 300

export default function Round3() {
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

    localStorage.setItem('round3Score', score.toString())

    const lampsRemaining = parseInt(localStorage.getItem('lampsRemaining')) || 4
    const newLampsRemaining = Math.max(lampsRemaining - 1, 1)
    localStorage.setItem('lampsRemaining', newLampsRemaining.toString())

    const user = JSON.parse(localStorage.getItem('user'))
    try {
      await submitRoundScore(user.email, ROUND_NUMBER, score)
    } catch (error) {
      console.error('Error submitting score:', error)
    }

    setResultMessage(`🎉 Round 3 Completed!\nYour Score: ${score} / ${questions.length}\nProceeding to Results...`)
    setResultType('success')

    setTimeout(() => {
      navigate('/results')
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
            <h1 className="round-title">ROUND 3</h1>
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
            {currentQuestionIndex === questions.length - 1 ? 'Complete Quest →' : 'Next Question →'}
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
