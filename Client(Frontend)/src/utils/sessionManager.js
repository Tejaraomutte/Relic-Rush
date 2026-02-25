// Session continuity manager for Relic Rush
// Saves and restores gameplay state across page refreshes

const SESSION_KEY = 'relicRush_gameSession'

export const saveGameSession = (sessionData) => {
  try {
    const session = {
      ...sessionData,
      timestamp: Date.now()
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch (error) {
    console.error('Failed to save game session:', error)
  }
}

export const loadGameSession = () => {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY)
    if (!sessionStr) return null
    
    const session = JSON.parse(sessionStr)
    
    // Session expires after 24 hours
    const MAX_SESSION_AGE = 24 * 60 * 60 * 1000
    if (Date.now() - session.timestamp > MAX_SESSION_AGE) {
      clearGameSession()
      return null
    }
    
    return session
  } catch (error) {
    console.error('Failed to load game session:', error)
    return null
  }
}

export const clearGameSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch (error) {
    console.error('Failed to clear game session:', error)
  }
}

export const updateGameSession = (updates) => {
  try {
    const currentSession = loadGameSession() || {}
    saveGameSession({ ...currentSession, ...updates })
  } catch (error) {
    console.error('Failed to update game session:', error)
  }
}

// Save round-specific state
export const saveRoundState = (roundNumber, stateData) => {
  updateGameSession({
    currentRound: roundNumber,
    [`round${roundNumber}State`]: {
      ...stateData,
      savedAt: Date.now()
    }
  })
}

// Load round-specific state
export const loadRoundState = (roundNumber) => {
  const session = loadGameSession()
  if (!session) return null
  
  return session[`round${roundNumber}State`] || null
}

// Get current active round
export const getActiveRound = () => {
  const session = loadGameSession()
  return session?.currentRound || null
}

// Mark round as completed
export const markRoundCompleted = (roundNumber) => {
  updateGameSession({
    [`round${roundNumber}Completed`]: true,
    currentRound: roundNumber < 3 ? roundNumber + 1 : null
  })
}

// Check if round is completed
export const isRoundCompleted = (roundNumber) => {
  const session = loadGameSession()
  return session?.[`round${roundNumber}Completed`] || false
}

// Initialize new game session
export const initGameSession = () => {
  saveGameSession({
    currentRound: 1,
    round1Completed: false,
    round2Completed: false,
    round3Completed: false,
    startedAt: Date.now()
  })
}
