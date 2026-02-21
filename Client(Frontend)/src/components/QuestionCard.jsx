import React from 'react'

/**
 * Unified QuestionCard component for quiz-style content
 * Used in Round 1 and can be adapted for other puzzle displays
 */
export default function QuestionCard({ 
  questionNumber = null,
  questionText = '',
  questionImage = null,
  children // For custom content inside the card
}) {
  return (
    <div className="question-display">
      {questionText && (
        <h2 className="question-text">
          {questionNumber !== null && `Q${questionNumber}. `}
          {questionText}
        </h2>
      )}

      {questionImage && (
        <div className="question-image-wrapper">
          <img src={questionImage} alt="Question" className="question-image" />
        </div>
      )}

      {children}
    </div>
  )
}
