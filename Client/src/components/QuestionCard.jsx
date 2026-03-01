import React from 'react'

/**
 * Unified QuestionCard component for quiz-style content
 * Used in Round 1 and can be adapted for other puzzle displays
 */
export default function QuestionCard({ 
  questionNumber = null,
  questionText = '',
  questionImage = null,
  preserveFormatting = false,
  children // For custom content inside the card
}) {
  const blockCopy = (event) => {
    event.preventDefault()
  }

  return (
    <div
      className="question-display"
      onCopy={blockCopy}
      onCut={blockCopy}
      onContextMenu={blockCopy}
      style={{ userSelect: 'none' }}
    >
      {questionText && (
        <h2 className={`question-text ${preserveFormatting ? 'question-text-preformatted' : ''}`}>
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
