import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import RoundHeader from '../components/RoundHeader'
import QuestionCard from '../components/QuestionCard'
import ActionButtons from '../components/ActionButtons'
import ResultMessage from '../components/ResultMessage'
import ScoreDisplay from '../components/ScoreDisplay'
import LampDisplay from '../components/LampDisplay'
import { submitRoundScore } from '../utils/api'
import { startTimer, autoSubmitRound, showResults } from '../utils/roundFlow'
import { saveRoundState, loadRoundState, markRoundCompleted, isRoundCompleted } from '../utils/sessionManager'

const questions = [
  {
    question: `In the Kingdom of Zafaran, the Sultan must send a royal message from City A (Golden Palace) to City F (Emerald Harbor).
  The desert roads have travel costs (in gold coins):
  Golden Palace (A) --4-- Spice Bazaar (B)
  Golden Palace (A) --2-- Mirage Oasis (C)
  Spice Bazaar (B) --5-- Mirage Oasis (C)
  Spice Bazaar (B) --10-- Ruby Fortress (D)
  Mirage Oasis (C) --3-- Pearl Garden (E)
  Pearl Garden (E) --4-- Ruby Fortress (D)
  Ruby Fortress (D) --11-- Emerald Harbor (F)
  Pearl Garden (E) --5-- Emerald Harbor (F)
  💰 Think Like a Royal Advisor
  •	Do not count number of cities.
  •	Count total gold cost.
  •	Choose the smallest total.

  What is the least costly route for the royal messenger to reach Emerald Harbor (F) from the Golden Palace (A)?`,
    questionImage: "src/assets/images/q1.jpeg",
    options: [
      { text: "A → B → D → F", image: null },
      { text: " A → C → E → F", image: null },
      { text: "A → C → E → D → F", image: null },
      { text: "A → B → C → E → F", image: null },
    ],
    correct: 1
  },
  {
    question: `In the Sultan’s golden courtyard, six enchanted treasure chests are arranged in a row:
  3, 1, 4, 1, 5, 9.
  The Royal Vizier performs one magical sweep from left to right.
  During this sweep:
  •	He compares each pair of neighboring chests.
  •	If the left chest is heavier than the right one, he swaps them.
  •	He continues this process only once across the row.
  After completing this single royal sweep, what is the new arrangement of the treasure chests?`,
    questionImage: "src/assets/images/q3.jpeg",
    options: [
      { text: "1, 3, 1, 4, 5, 9", image: null },
      { text: "3, 1, 4, 1, 5, 9", image: null },
      { text: "9, 5, 4, 1, 3, 1", image: null },
      { text: "1, 1, 3, 4, 5, 9", image: null }
    ],
    correct: 0
  },
  {
    question: `S4. In the ancient desert kingdom, a royal scroll contains the following encrypted character array:
char a[] = {
'N','O','d','m','a','e','d','t','s',
'r','i','e','b','e','r','s','O','t',
'a','s','n','i','s','i','w','a','g',
't','e','h','r','s','t'
};
The royal programmer casts this spell:
char clue[50];
int j = 0;

for(int i = 0; i < 33; i++) {
    if((i + 1) % 3 == 0) {   // Position counting starts from 1
        clue[j] = a[i];
        j++;
    }
}
clue[j] = '\0';
printf("%s", clue);
What is the output of the above code?`,
    questionImage: "src/assets/images/q2.jpeg",
    options: [
      { text: " Nomadtribes", image: null },
      { text: "desertnight", image: null },
      { text: "Oasiswaters", image: null },
      { text: "desertlight", image: null }
    ],
    correct: 1
  },
  {
    question: `In the Sultan’s ancient palace lies a mystical floor made of enchanted tiles.
Each tile hides sacred energy, and only the wisest explorers can reveal its true power.
The Royal Architect presents a strange formation of tiles.
He whispers:
“Every complete square hidden within the pattern holds magical strength.
Count wisely… for even smaller squares within larger ones possess power.”
A sample sacred tile formation below contains 5 total squares.
Now, the Grand Vizier reveals a larger enchanted pattern.
Your task is to uncover all possible squares hidden inside the formation —
including small, medium, and large ones.`,
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
    question: `Deep within the Sultan’s secret chamber lies a mystical wall carved with ancient symbols.
These symbols were designed by royal scholars to protect the Original Genie Lamp.
However, time has damaged one portion of the sacred pattern…
A section of the magical carving has vanished, leaving behind a missing symbol marked with a question mark (?).
Question:
Find the correct figure from the given options that perfectly replaces the missing part (?) in the problem figure and restores the royal pattern.`,
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
const ROUND_DURATION = 900
const POINTS_PER_QUESTION = 5
const QUALIFICATION_SCORE = 10

export default function Round1({ reduceLamps, lampsRemaining = 4 }) {
  const navigate = useNavigate()
  
  // Initialize state with saved values or defaults - load fresh on each mount
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const savedState = loadRoundState(1)
    console.log('Round1 - Loading saved state:', savedState)
    return savedState?.currentQuestionIndex ?? 0
  })
  
  const [selectedAnswers, setSelectedAnswers] = useState(() => {
    const savedState = loadRoundState(1)
    return savedState?.selectedAnswers ?? new Array(questions.length).fill(null)
  })
  
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedState = loadRoundState(1)
    return savedState?.timeLeft ?? ROUND_DURATION
  })
  
  const startedAtRef = useRef(loadRoundState(1)?.startedAt ?? Date.now())
  
  const submittedRef = useRef(false)
  const selectedAnswersRef = useRef([])
  const [resultMessage, setResultMessage] = useState('')
  const [resultType, setResultType] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [isAnswerLocked, setIsAnswerLocked] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [lampsAfter, setLampsAfter] = useState(lampsRemaining)
  const [hasReduced, setHasReduced] = useState(false)
  const blockCopy = (event) => event.preventDefault()

  // Check if round already completed on mount
  useEffect(() => {
    const existingScore = Number(localStorage.getItem('round1Score') || 0)
    
    if (isRoundCompleted(1) || existingScore > 0) {
      navigate('/round2', { replace: true })
    }
  }, [navigate])

  // Save state periodically
  useEffect(() => {
    if (isComplete || isAnswerLocked) return

    const saveInterval = setInterval(() => {
      saveRoundState(1, {
        currentQuestionIndex,
        selectedAnswers,
        timeLeft,
        startedAt: startedAtRef.current
      })
    }, 2000) // Save every 2 seconds

    return () => clearInterval(saveInterval)
  }, [currentQuestionIndex, selectedAnswers, timeLeft, isComplete, isAnswerLocked])

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers
  }, [selectedAnswers])

  useEffect(() => {
    if (isComplete || isAnswerLocked) return

    const handlePopState = () => {
      if (!isComplete && !isAnswerLocked) {
        window.history.pushState(null, '', window.location.href)
      }
    }

    window.history.pushState(null, '', window.location.href)
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
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isComplete, isAnswerLocked])

  useEffect(() => {
    // DEVELOPMENT MODE: Allow direct access without login
    if (isComplete || isAnswerLocked) return

    const stopTimer = startTimer({
      duration: ROUND_DURATION,
      onTick: setTimeLeft,
      onTimeUp: onTimeUp,
      isLocked: () => submittedRef.current || isAnswerLocked || isComplete
    })

    return stopTimer
  }, [navigate, isComplete, isAnswerLocked])

  const onTimeUp = async () => {
    if (submittedRef.current) return

    showResultMessage('Time is up! Submitting your answers...', 'info')
    await new Promise(r => setTimeout(r, 600))
    await autoSubmitRound({
      submittedRef,
      lockRound: () => setIsAnswerLocked(true),
      submitRound: () => completeRound(selectedAnswersRef.current, true)
    })
  }

  const handleSelectOption = (optionIndex) => {
    if (isAnswerLocked || submittedRef.current || isComplete) return

    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = optionIndex
    setSelectedAnswers(newAnswers)
  }

  const handleSubmitQuestion = async () => {
    if (isAnswerLocked || submittedRef.current || isComplete) return

    if (currentQuestionIndex === questions.length - 1) {
      await autoSubmitRound({
        submittedRef,
        lockRound: () => setIsAnswerLocked(true),
        submitRound: () => completeRound(selectedAnswers, false)
      })
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const completeRound = async (answers, wasAutoSubmitted) => {
    setIsAnswerLocked(true)

    const correctCount = answers.reduce((total, answer, index) => {
      if (answer === questions[index].correct) return total + 1
      return total
    }, 0)

    const score = correctCount * POINTS_PER_QUESTION
    const questionsSolved = correctCount
    const elapsedSeconds = Math.min(
      Math.max(Math.round((Date.now() - startedAtRef.current) / 1000), 0),
      ROUND_DURATION
    )
    const qualificationStatus = score >= QUALIFICATION_SCORE ? 'Qualified' : 'Not Qualified'

    setFinalScore(score)
    localStorage.setItem('round1Score', score.toString())

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    try {
      if (user && user.teamName) {
        await submitRoundScore(user.teamName, ROUND_NUMBER, score, questionsSolved, [], elapsedSeconds)
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

    // Mark round as completed in session
    markRoundCompleted(1)
    
    setIsComplete(true)

    showResults({
      navigate,
      mode: 'round1',
      resultData: {
        score,
        timeTakenSeconds: elapsedSeconds,
        qualificationStatus,
        wasAutoSubmitted
      }
    })
  }

  const showResultMessage = (message, type) => {
    setResultMessage(message)
    setResultType(type)
    setTimeout(() => {
      setResultMessage('')
    }, 3000)
  }

  const question = questions[currentQuestionIndex]

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
          roundTitle="ROUND 1"
          subtitle=""
          lampsRemaining={null}
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
                ...(currentQuestionIndex > 0 ? [{
                  label: 'Previous Question',
                  variant: 'btn-secondary',
                  onClick: () => setCurrentQuestionIndex(prev => prev - 1),
                  disabled: isAnswerLocked || submittedRef.current
                }] : []),
                {
                  label: currentQuestionIndex === questions.length - 1 ? 'Submit Answers' : 'Next Question',
                  variant: 'btn-golden',
                  onClick: handleSubmitQuestion,
                  disabled: isAnswerLocked || submittedRef.current
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
