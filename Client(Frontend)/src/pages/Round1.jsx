import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import RoundHeader from '../components/RoundHeader'
import QuestionCard from '../components/QuestionCard'
import ActionButtons from '../components/ActionButtons'
import ResultMessage from '../components/ResultMessage'
import ScoreDisplay from '../components/ScoreDisplay'
import LampDisplay from '../components/LampDisplay'
import { submitRoundScore } from '../utils/api'

const questions = [
  {
    question: "Find the intruder",
    questionImage: "src/assets/images/q1.webp",
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
    questionImage: "src/assets/images/q2.jpg",
    options: [
      { text: "7", image: null },
      { text: "4", image: null },
      { text: "6", image: null },
      { text: "5", image: null }
    ],
    correct: 1
  },
  {
    question: "Solve this number visual riddle",
    questionImage: "src/assets/images/q3.webp",
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
    questionImage: "src/assets/images/q4.webp",
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
    questionImage: "src/assets/images/q5.png",
    options: [
      { text: null, image: "src/assets/images/q5-1.png" },
      { text: null, image: "src/assets/images/q5-2.png" },
      { text: null, image: "src/assets/images/q5-3.png" },
      { text: null, image: "src/assets/images/q5-4.png" }
    ],
    correct: 0
  }
]

const ROUND_NUMBER = 1
const ROUND_DURATION = 300
const POINTS_PER_QUESTION = 5

export default function Round1({ reduceLamps, lampsRemaining = 4 }) {
  const navigate = useNavigate()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState(new Array(questions.length).fill(null))
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION)
  const [resultMessage, setResultMessage] = useState('')
  const [resultType, setResultType] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [lampsAfter, setLampsAfter] = useState(lampsRemaining)
  const [hasReduced, setHasReduced] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      navigate('/login')
      return
    }

    if (isComplete) return

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

    return () => clearInterval(id)
  }, [navigate, isComplete])

  const onTimeUp = async () => {
    showResultMessage('Time is up! Submitting your answers...', 'info')
    await new Promise(r => setTimeout(r, 600))
    await completeRound(selectedAnswers)
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
      await completeRound(selectedAnswers)
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const completeRound = async (answers) => {
    const correctCount = answers.reduce((total, answer, index) => {
      if (answer === questions[index].correct) return total + 1
      return total
    }, 0)

    const score = correctCount * POINTS_PER_QUESTION
    setFinalScore(score)
    localStorage.setItem('round1Score', score.toString())

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    try {
      if (user && user.email) {
        await submitRoundScore(user.email, ROUND_NUMBER, score)
      }
    } catch (error) {
      console.error('Error submitting score:', error)
      showResultMessage('Score saved locally. Online submission failed.', 'error')
    }

    if (!hasReduced && reduceLamps) {
      setHasReduced(true)
      setLampsAfter(Math.max(lampsRemaining - 1, 1))
      reduceLamps()
    }

    setIsComplete(true)
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
      navigate('/home')
    }
  }

  const question = questions[currentQuestionIndex]

  return (
    <>
      <Background />
      <main className="event-container">
        <RoundHeader
          roundTitle="ROUND 1"
          subtitle="Solve the riddles - 5 points each"
          lampsRemaining={lampsRemaining}
          timeLeft={timeLeft}
          showTimer={!isComplete}
        />

        {!isComplete ? (
          <div className="quiz-container">
            <QuestionCard
              questionNumber={currentQuestionIndex + 1}
              questionText={question.question}
              questionImage={question.questionImage}
            >
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
            </QuestionCard>

            <ActionButtons
              buttons={[
                { label: 'Go Home', variant: 'btn-secondary', onClick: handleGoBack },
                {
                  label: currentQuestionIndex === questions.length - 1 ? 'Submit Answers' : 'Next Question',
                  variant: 'btn-golden',
                  onClick: handleSubmitQuestion
                }
              ]}
            />

            <ResultMessage message={resultMessage} type={resultType} visible={!!resultMessage} />
          </div>
        ) : (
          <section className="round-complete">
            <LampDisplay lampsRemaining={lampsAfter} showMessage={false} />
            <ScoreDisplay
              scores={[
                { label: 'Round 1 Score', value: finalScore },
                { label: 'Max Possible', value: questions.length * POINTS_PER_QUESTION }
              ]}
              showTotal={false}
            />
            <ActionButtons
              buttons={[
                { label: 'Proceed to Round 2', variant: 'btn-golden', onClick: () => navigate('/round2') }
              ]}
            />
          </section>
        )}
      </main>
    </>
  )
}
