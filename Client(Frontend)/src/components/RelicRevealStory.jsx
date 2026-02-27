import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './RelicRevealStory.css'

// Use Vite's import.meta.glob for robust asset loading
const frameImages = Object.values(import.meta.glob('../assets/images/story/slide 4/*.{png,jpg,jpeg}', { eager: true, import: 'default' })).sort();

const conversations = [
  [
    { speaker: 'Player 1', text: 'We’re back…' },
    { speaker: 'Player 2', text: 'But something is different.' },
  ],
  [
    { speaker: 'Player 1', text: 'Only one lamp remains.' },
    { speaker: 'Player 2', text: 'This must be the true relic.' },
  ],
  [
    { speaker: 'Player 1', text: 'It’s glowing stronger.' },
    { speaker: 'Player 2', text: 'Step back… something is awakening.' },
  ],
  [
    { speaker: 'Guardian', text: 'You have endured the trials.' },
    { speaker: 'Guardian', text: 'The relic recognizes its worthy seekers.' },
  ],
  [], // Frame 19: no conversation
]


export default function RelicRevealStory({ onBackToScore }) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const isLast = currentFrame === 4
  const navigate = useNavigate()
  const location = useLocation()

  const handleNext = () => {
    if (!isLast) setCurrentFrame(f => f + 1)
  }

  const handleBackToScore = () => {
    // If onBackToScore is provided (overlay mode), use it. Otherwise, navigate to /results
    if (onBackToScore) {
      onBackToScore()
    } else {
      navigate('/results')
    }
  }

  return (
    <div className="relic-reveal-overlay">
      <div className="relic-reveal-bg" />
      <div className={`relic-reveal-frame fade-in ${isLast ? 'last-frame' : ''}`}>
        <img
          src={frameImages[currentFrame]}
          alt="Relic Story Frame"
          className={`relic-reveal-img ${isLast ? 'relic-reveal-img-last' : ''}`}
        />
        {currentFrame < 4 && (
          <div className="relic-reveal-convo">
            {conversations[currentFrame].map((line, i) => (
              <div key={i} className="relic-reveal-line">
                <span className="relic-reveal-speaker">{line.speaker}:</span> {line.text}
              </div>
            ))}
          </div>
        )}
        <div className="relic-reveal-actions">
          {isLast ? (
            <button className="relic-reveal-btn-gold" onClick={handleBackToScore}>← Back to Score</button>
          ) : (
            <button className="relic-reveal-btn-next" onClick={handleNext}>Next →</button>
          )}
        </div>
      </div>
    </div>
  )
}
