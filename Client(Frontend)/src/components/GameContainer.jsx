import React from 'react'

/**
 * Unified GameContainer component for Round 2 games
 * Wraps game content with consistent Arabian Nights styling
 */
export default function GameContainer({ 
  gameTitle = 'Game',
  instructions = null,
  children,
  showInstructions = true
}) {
  return (
    <div className="quiz-container">
      <div className="question-display">
        {gameTitle && <h2 className="question-text">{gameTitle}</h2>}
        
        {showInstructions && instructions && (
          <div className="game-instructions">
            {typeof instructions === 'string' ? (
              <p>{instructions}</p>
            ) : (
              instructions
            )}
          </div>
        )}

        <div className="game-content">
          {children}
        </div>
      </div>
    </div>
  )
}
