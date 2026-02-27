import React from 'react'

/**
 * Unified ScoreDisplay component for showing scores
 * Used in results pages and in-game score tracking
 */
export default function ScoreDisplay({ 
  scores = [], 
  showTotal = false,
  animated = true 
}) {
  const calculateTotal = () => {
    return scores.reduce((sum, score) => sum + (score.value || 0), 0)
  }

  return (
    <div className={`score-card ${animated ? 'animated' : ''}`}>
      {scores.map((score, index) => (
        <div
          key={index}
          className={`score-item ${score.isTotal ? 'total' : ''}`}
        >
          <span className="score-label">{score.label}</span>
          <span className="score-value">{score.value}</span>
        </div>
      ))}
      
      {showTotal && scores.length > 0 && !scores.some(s => s.isTotal) && (
        <div
          className="score-item total"
        >
          <span className="score-label">Total Score</span>
          <span className="score-value">{calculateTotal()}</span>
        </div>
      )}
    </div>
  )
}
