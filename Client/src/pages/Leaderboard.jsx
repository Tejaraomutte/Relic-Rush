import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import { getAdminLeaderboard } from '../utils/api'

export default function Leaderboard() {
  const navigate = useNavigate()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [teamName, setTeamName] = useState('')

  useEffect(() => {
    const storedTeamName = localStorage.getItem('teamName')
    const token = localStorage.getItem('token')
    
    if (!storedTeamName || !token) {
      navigate('/login')
      return
    }

    setTeamName(storedTeamName)
    fetchLeaderboard(token)
  }, [navigate])

  const fetchLeaderboard = async (token) => {
    try {
      setLoading(true)
      const data = await getAdminLeaderboard(token)
      setLeaderboard(data)
      setError('')
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setError(err.message || 'Failed to load leaderboard')
      
      // If unauthorized, redirect to login
      if (err.message && err.message.includes('403')) {
        setError('Access denied. Admin privileges required.')
        setTimeout(() => navigate('/login'), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const formatTime = (seconds) => {
    const safeSeconds = Number(seconds)
    if (!Number.isFinite(safeSeconds) || safeSeconds < 0) return '--'
    const mins = Math.floor(safeSeconds / 60)
    const secs = safeSeconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <>
      <Background />
      <main
        className="event-container leaderboard-container admin-leaderboard-page premium-glass-container premium-fade-in"
      >
        <header className="leaderboard-header admin-leaderboard-header premium-glow-text">
          <h1 className="event-title admin-leaderboard-title premium-gold-gradient">ADMIN LEADERBOARD</h1>
          <p className="event-subtitle admin-leaderboard-subtitle premium-glow-text">Welcome, {teamName}</p>
          <button 
            onClick={handleLogout}
            className="btn btn-golden logout-btn premium-glow-btn admin-logout-btn"
          >
            <span className="btn-text">Logout</span>
          </button>
        </header>

        <div className="leaderboard-card premium-glass-card admin-leaderboard-card">
          {loading && (
            <div className="loading-message premium-glow-text admin-state-message">
              Loading leaderboard...
            </div>
          )}

          {error && (
            <div className="error-message premium-glow-text admin-state-message admin-error-message">
              {error}
            </div>
          )}

          {!loading && !error && leaderboard.length === 0 && (
            <div className="empty-message premium-glow-text admin-state-message">
              No teams have submitted scores yet.
            </div>
          )}

          {!loading && !error && leaderboard.length > 0 && (
            <div className="admin-leaderboard-table-container">
              <table className="admin-leaderboard-table">
                <thead>
                  <tr>
                    <th className="admin-col-rank">Rank</th>
                    <th className="admin-col-team">Team Name</th>
                    <th className="admin-col-score">Total Score</th>
                    <th className="admin-col-time">Total Time</th>
                    <th className="admin-col-round admin-col-round1">Round 1</th>
                    <th className="admin-col-round admin-col-round2">Round 2</th>
                    <th className="admin-col-round admin-col-round3">Round 3</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => {
                    const round1 = entry.rounds?.find(r => r.roundNumber === 1)
                    const round2 = entry.rounds?.find(r => r.roundNumber === 2)
                    const round3 = entry.rounds?.find(r => r.roundNumber === 3)
                    
                    return (
                      <tr 
                        key={index}
                        className={entry.rank <= 3 ? 'admin-highlight-row' : ''}
                      >
                        <td className={`admin-rank-value rank-${entry.rank}`}>
                          {entry.rank}
                        </td>
                        <td className="admin-team-name">
                          {entry.teamName}
                        </td>
                        <td className="admin-total-score">
                          {entry.totalScore || 0}
                        </td>
                        <td className="admin-total-time">
                          {formatTime(entry.totalCompletionTime)}
                        </td>
                        <td className="admin-round-cell admin-round-cell-1">
                          <div className="admin-round-score admin-round-score-1">
                            {round1 ? round1.roundScore : '--'}
                          </div>
                          <div className="admin-round-time">
                            {round1 && Number(round1.roundScore) > 0 ? formatTime(round1.totalRoundTime) : '--'}
                          </div>
                        </td>
                        <td className="admin-round-cell admin-round-cell-2">
                          <div className="admin-round-score admin-round-score-2">
                            {round2 ? round2.roundScore : '--'}
                          </div>
                          <div className="admin-round-time">
                            {round2 && Number(round2.roundScore) > 0 ? formatTime(round2.totalRoundTime) : '--'}
                          </div>
                        </td>
                        <td className="admin-round-cell admin-round-cell-3">
                          <div className="admin-round-score admin-round-score-3">
                            {round3 ? round3.roundScore : '--'}
                          </div>
                          <div className="admin-round-time">
                            {round3 && Number(round3.roundScore) > 0 ? formatTime(round3.totalRoundTime) : '--'}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
