import React from 'react'

/**
 * Unified ActionButtons component for consistent button groups
 * Used across all rounds for navigation and actions
 */
export default function ActionButtons({ 
  buttons = [], 
  centered = true 
}) {
  return (
    <div className={`round-actions ${centered ? '' : 'left-align'}`}>
      {buttons.map((button, index) => (
        <button
          key={index}
          className={`btn ${button.variant || 'btn-golden'}`}
          onClick={button.onClick}
          disabled={button.disabled || false}
        >
          {button.label}
        </button>
      ))}
    </div>
  )
}
