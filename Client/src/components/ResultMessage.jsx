import React from 'react'

/**
 * Unified ResultMessage component for displaying feedback
 * Supports success, error, and info states
 */
export default function ResultMessage({ 
  message = '',
  type = 'info', // 'success', 'error', 'info'
  visible = false 
}) {
  if (!visible || !message) return null

  return (
    <div className={`result-message ${type} visible`}>
      {message}
    </div>
  )
}
