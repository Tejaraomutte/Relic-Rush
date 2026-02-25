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
    if (!seconds) return '--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <>
      <Background />
      <main className="event-container leaderboard-container premium-glass-container premium-fade-in" style={{ paddingBottom: '40px' }}>
        <header className="leaderboard-header premium-glow-text" style={{ marginBottom: '0px', paddingBottom: '30px' }}>
          <h1 className="event-title premium-gold-gradient" style={{ marginBottom: '10px' }}>ADMIN LEADERBOARD</h1>
          <p className="event-subtitle premium-glow-text" style={{ marginBottom: '0px' }}>Welcome, {teamName}</p>
          <button 
            onClick={handleLogout}
            className="btn btn-golden logout-btn premium-glow-btn"
            style={{ position: 'absolute', top: '20px', right: '20px', padding: '10px 20px' }}
          >
            <span className="btn-text">Logout</span>
          </button>
        </header>

        <div className="leaderboard-card premium-glass-card" style={{ maxWidth: '1200px', margin: '20px auto 0 auto', padding: '0px' }}>
          {loading && (
            <div className="loading-message premium-glow-text" style={{ textAlign: 'center', fontSize: '1.2rem', padding: '30px' }}>
              Loading leaderboard...
            </div>
          )}

          {error && (
            <div className="error-message premium-glow-text" style={{ textAlign: 'center', color: '#ff6b6b', fontSize: '1.2rem', padding: '30px' }}>
              {error}
            </div>
          )}

          {!loading && !error && leaderboard.length === 0 && (
            <div className="empty-message premium-glow-text" style={{ textAlign: 'center', fontSize: '1.2rem', padding: '30px' }}>
              No teams have submitted scores yet.
            </div>
          )}

          {!loading && !error && leaderboard.length > 0 && (
            <div className="leaderboard-table-container" style={{ overflowX: 'auto', padding: '30px 30px 30px 30px' }}>
              <table className="leaderboard-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', marginTop: '0px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(212, 175, 55, 0.5)', backgroundColor: 'transparent' }}>
                    <th style={{ padding: '15px 8px', textAlign: 'center', color: '#d4af37', fontSize: '0.95rem', fontWeight: 'bold', width: '8%' }}>Rank</th>
                    <th style={{ padding: '15px 8px', textAlign: 'left', color: '#d4af37', fontSize: '0.95rem', fontWeight: 'bold', width: '17%' }}>Team Name</th>
                    <th style={{ padding: '15px 8px', textAlign: 'center', color: '#d4af37', fontSize: '0.95rem', fontWeight: 'bold', width: '15%' }}>Total Score</th>
                    <th style={{ padding: '15px 8px', textAlign: 'center', color: '#d4af37', fontSize: '0.95rem', fontWeight: 'bold', width: '15%' }}>Total Time</th>
                    <th style={{ padding: '15px 8px', textAlign: 'center', color: '#ffd700', fontSize: '0.90rem', fontWeight: 'bold', width: '15%' }}>Round 1</th>
                    <th style={{ padding: '15px 8px', textAlign: 'center', color: '#c0c0c0', fontSize: '0.90rem', fontWeight: 'bold', width: '15%' }}>Round 2</th>
                    <th style={{ padding: '15px 8px', textAlign: 'center', color: '#cd7f32', fontSize: '0.90rem', fontWeight: 'bold', width: '15%' }}>Round 3</th>
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
                        style={{ 
                          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                          backgroundColor: entry.rank <= 3 ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                          height: '75px'
                        }}
                      >
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '1.3rem', fontWeight: 'bold', color: entry.rank === 1 ? '#ffd700' : entry.rank === 2 ? '#c0c0c0' : entry.rank === 3 ? '#cd7f32' : '#fff', verticalAlign: 'middle', width: '8%' }}>
                          {entry.rank}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'left', fontSize: '1rem', color: '#fff', fontWeight: 'bold', verticalAlign: 'middle', width: '17%' }}>
                          {entry.teamName}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#d4af37', verticalAlign: 'middle', width: '15%' }}>
                          {entry.totalScore || 0}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.90rem', color: '#aaa', fontWeight: 'bold', verticalAlign: 'middle', width: '15%' }}>
                          {formatTime(entry.totalCompletionTime)}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.90rem', color: '#fff', backgroundColor: 'rgba(255, 215, 0, 0.08)', verticalAlign: 'middle', width: '15%' }}>
                          <div style={{ fontWeight: 'bold', color: '#ffd700', fontSize: '1.05rem' }}>
                            {round1 ? round1.roundScore : '--'}
                          </div>
                          <div style={{ fontSize: '0.77rem', color: '#aaa', marginTop: '2px' }}>
                            {round1 ? formatTime(round1.totalRoundTime) : '--'}
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.90rem', color: '#fff', backgroundColor: 'rgba(192, 192, 192, 0.08)', verticalAlign: 'middle', width: '15%' }}>
                          <div style={{ fontWeight: 'bold', color: '#c0c0c0', fontSize: '1.05rem' }}>
                            {round2 ? round2.roundScore : '--'}
                          </div>
                          <div style={{ fontSize: '0.77rem', color: '#aaa', marginTop: '2px' }}>
                            {round2 ? formatTime(round2.totalRoundTime) : '--'}
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.90rem', color: '#fff', backgroundColor: 'rgba(205, 127, 50, 0.08)', verticalAlign: 'middle', width: '15%' }}>
                          <div style={{ fontWeight: 'bold', color: '#cd7f32', fontSize: '1.05rem' }}>
                            {round3 ? round3.roundScore : '--'}
                          </div>
                          <div style={{ fontSize: '0.77rem', color: '#aaa', marginTop: '2px' }}>
                            {round3 ? formatTime(round3.totalRoundTime) : '--'}
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
