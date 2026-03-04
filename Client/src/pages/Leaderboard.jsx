import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import { createTeamByAdmin, getAdminLeaderboard, updateTeamByAdmin } from '../utils/api'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [teamName, setTeamName] = useState('')
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [showAddTeamForm, setShowAddTeamForm] = useState(false)
  const [showTeamPassword, setShowTeamPassword] = useState(false)
  const [formData, setFormData] = useState({
    teamName: '',
    player1Name: '',
    player2Name: '',
    teamMembers: '',
    password: ''
  })
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTeamId, setEditingTeamId] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState('')
  const [editForm, setEditForm] = useState({
    teamName: '',
    player1Name: '',
    player2Name: '',
    password: '',
    round1Score: 0,
    round1Time: 0,
    round2Score: 0,
    round2Time: 0,
    round3Score: 0,
    round3Time: 0,
    totalScore: 0,
    totalTime: 0,
    isLoggedIn: false,
    currentRound: 1
  })

  useEffect(() => {
    const storedTeamName = sessionStorage.getItem('teamName')
    const token = sessionStorage.getItem('token')

    if (storedTeamName) {
      setTeamName(storedTeamName)
    }

    if (!token) {
      setIsAdminAuthenticated(false)
      setLoading(false)
      return
    }

    fetchLeaderboard(token, { withLoader: true })
  }, [navigate])

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    const role = sessionStorage.getItem('role')

    if (!token || role !== 'admin') {
      return undefined
    }

    const syncDashboard = () => {
      fetchLeaderboard(token)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncDashboard()
      }
    }

    window.addEventListener('focus', syncDashboard)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const intervalId = window.setInterval(syncDashboard, 10000)

    return () => {
      window.removeEventListener('focus', syncDashboard)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.clearInterval(intervalId)
    }
  }, [])

  const fetchLeaderboard = async (token, { withLoader = false } = {}) => {
    try {
      if (withLoader) {
        setLoading(true)
      }
      const data = await getAdminLeaderboard(token)
      setLeaderboard(data)
      setIsAdminAuthenticated(true)
      setError('')
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setIsAdminAuthenticated(false)
      setError(err.message || 'Failed to load dashboard')
    } finally {
      if (withLoader) {
        setLoading(false)
      }
    }
  }

  const handleLogout = () => {
    sessionStorage.clear()
    setShowAddTeamForm(false)
    setIsAdminAuthenticated(false)
    setLeaderboard([])
    navigate('/login')
  }

  const handleAdminLoginClick = () => {
    setShowAddTeamForm(prev => !prev)
    setSubmitError('')
    setSubmitMessage('')
  }

  const toggleTeamPasswordVisibility = () => {
    setShowTeamPassword((prev) => !prev)
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddTeam = async (event) => {
    event.preventDefault()

    const token = sessionStorage.getItem('token')
    const payload = {
      teamName: formData.teamName.trim(),
      player1Name: formData.player1Name.trim(),
      player2Name: formData.player2Name.trim(),
      teamMembers: formData.teamMembers
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean),
      password: formData.password.trim()
    }

    setSubmitMessage('')
    setSubmitError('')

    if (!payload.teamName || !payload.player1Name || !payload.password) {
      setSubmitError('Team Name, Player 1 Name, and Password are required.')
      return
    }

    try {
      setSubmitting(true)
      await createTeamByAdmin(token, payload)

      setSubmitMessage('New team added successfully.')
      setShowAddTeamForm(false)
      setShowTeamPassword(false)
      setFormData({
        teamName: '',
        player1Name: '',
        player2Name: '',
        teamMembers: '',
        password: ''
      })

      await fetchLeaderboard(token)
    } catch (err) {
      setSubmitError(err.message || 'Failed to add team.')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (team) => {
    setEditingTeamId(team._id)
    setEditError('')
    setEditForm({
      teamName: team.teamName || '',
      player1Name: team.player1Name || '',
      player2Name: team.player2Name || '',
      password: '',
      round1Score: Number(team.round1Score || 0),
      round1Time: Number(team.round1Time || 0),
      round2Score: Number(team.round2Score || 0),
      round2Time: Number(team.round2Time || 0),
      round3Score: Number(team.round3Score || 0),
      round3Time: Number(team.round3Time || 0),
      totalScore: Number(team.totalScore || 0),
      totalTime: Number(team.totalTime || team.totalCompletionTime || 0),
      isLoggedIn: Boolean(team.isLoggedIn),
      currentRound: Number(team.currentRound || 1)
    })
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingTeamId('')
    setEditError('')
  }

  const handleEditFieldChange = (event) => {
    const { name, value, type, checked } = event.target
    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()

    const token = sessionStorage.getItem('token')
    const payload = {
      teamName: String(editForm.teamName || '').trim(),
      player1Name: String(editForm.player1Name || '').trim(),
      player2Name: String(editForm.player2Name || '').trim(),
      password: String(editForm.password || '').trim(),
      round1Score: Number(editForm.round1Score || 0),
      round1Time: Number(editForm.round1Time || 0),
      round2Score: Number(editForm.round2Score || 0),
      round2Time: Number(editForm.round2Time || 0),
      round3Score: Number(editForm.round3Score || 0),
      round3Time: Number(editForm.round3Time || 0),
      totalScore: Number(editForm.totalScore || 0),
      totalTime: Number(editForm.totalTime || 0),
      isLoggedIn: Boolean(editForm.isLoggedIn),
      currentRound: Math.min(3, Math.max(1, Number(editForm.currentRound || 1)))
    }

    if (!payload.teamName || !payload.player1Name) {
      setEditError('Team Name and Player 1 Name are required.')
      return
    }

    try {
      setEditSubmitting(true)
      setEditError('')
      await updateTeamByAdmin(token, editingTeamId, payload)
      closeEditModal()
      await fetchLeaderboard(token)
    } catch (err) {
      setEditError(err.message || 'Failed to update team.')
    } finally {
      setEditSubmitting(false)
    }
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
          <h1 className="event-title admin-leaderboard-title premium-gold-gradient">ADMIN DASHBOARD</h1>
          <p className="event-subtitle admin-leaderboard-subtitle premium-glow-text">
            {isAdminAuthenticated ? `Welcome, ${teamName}` : 'Login to manage teams and view controls'}
          </p>
          <div className="admin-header-actions">
            <button
              onClick={handleAdminLoginClick}
              className="btn btn-golden premium-glow-btn admin-login-compact-btn"
            >
              <span className="btn-text">{showAddTeamForm ? 'Close' : 'Login'}</span>
            </button>

            {isAdminAuthenticated && (
              <button
                onClick={handleLogout}
                className="btn btn-golden logout-btn premium-glow-btn admin-logout-btn"
              >
                <span className="btn-text">Logout</span>
              </button>
            )}
          </div>
        </header>

        <div className="leaderboard-card premium-glass-card admin-leaderboard-card">
          {loading && (
            <div className="loading-message premium-glow-text admin-state-message">
              Loading dashboard...
            </div>
          )}

          {error && (
            <div className="error-message premium-glow-text admin-state-message admin-error-message">
              {error}
            </div>
          )}

          {!loading && isAdminAuthenticated && showAddTeamForm && (
            <div className="admin-auth-box">
              <form className="admin-login-inline-form" onSubmit={handleAddTeam}>
                <div className="admin-login-inline-grid">
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    className="form-input login-glass-input"
                    placeholder="Team name"
                    required
                  />
                  <input
                    type="text"
                    name="player1Name"
                    value={formData.player1Name}
                    onChange={handleInputChange}
                    className="form-input login-glass-input"
                    placeholder="Player 1 name"
                    required
                  />
                  <input
                    type="text"
                    name="player2Name"
                    value={formData.player2Name}
                    onChange={handleInputChange}
                    className="form-input login-glass-input"
                    placeholder="Player 2 name (optional)"
                  />
                  <div className="admin-inline-password">
                    <input
                      type={showTeamPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-input login-glass-input"
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={toggleTeamPasswordVisibility}
                      className="admin-password-toggle"
                    >
                      {showTeamPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-golden premium-glow-btn admin-login-submit-btn"
                    disabled={submitting}
                  >
                    <span className="btn-text">{submitting ? 'Adding...' : 'Add Team'}</span>
                  </button>
                </div>

                {submitMessage && (
                  <div className="loading-message premium-glow-text admin-state-message admin-login-error">
                    {submitMessage}
                  </div>
                )}

                {submitError && (
                  <div className="error-message premium-glow-text admin-state-message admin-error-message admin-login-error">
                    {submitError}
                  </div>
                )}
              </form>
            </div>
          )}

          {!loading && isAdminAuthenticated && !error && leaderboard.length === 0 && (
            <div className="empty-message premium-glow-text admin-state-message">
              No teams have submitted scores yet.
            </div>
          )}

          {!loading && isAdminAuthenticated && !error && leaderboard.length > 0 && (
            <div className="admin-leaderboard-table-container">
              <table className="admin-leaderboard-table">
                <thead>
                  <tr>
                    <th className="admin-col-rank">Rank</th>
                    <th className="admin-col-team">Team Name</th>
                    <th className="admin-col-team">Player 1</th>
                    <th className="admin-col-team">Player 2</th>
                    <th className="admin-col-round admin-col-round1">Round 1</th>
                    <th className="admin-col-round admin-col-round2">Round 2</th>
                    <th className="admin-col-round admin-col-round3">Round 3</th>
                    <th className="admin-col-score">Total Score</th>
                    <th className="admin-col-time">Total Time</th>
                    <th className="admin-col-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => {
                    const round1Score = Number(entry.round1Score || 0)
                    const round1Time = Number(entry.round1Time || 0)
                    const round2Score = Number(entry.round2Score || 0)
                    const round2Time = Number(entry.round2Time || 0)
                    const round3Score = Number(entry.round3Score || 0)
                    const round3Time = Number(entry.round3Time || 0)
                    const totalTime = Number(entry.totalTime || entry.totalCompletionTime || 0)
                    
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
                        <td className="admin-team-name">
                          {entry.player1Name || '--'}
                        </td>
                        <td className="admin-team-name">
                          {entry.player2Name || 'Solo'}
                        </td>
                        <td className="admin-round-cell admin-round-cell-1">
                          <div className="admin-round-score admin-round-score-1">{round1Score > 0 ? round1Score : '--'}</div>
                          <div className="admin-round-time">{round1Score > 0 ? formatTime(round1Time) : '--'}</div>
                        </td>
                        <td className="admin-round-cell admin-round-cell-2">
                          <div className="admin-round-score admin-round-score-2">{round2Score > 0 ? round2Score : '--'}</div>
                          <div className="admin-round-time">{round2Score > 0 ? formatTime(round2Time) : '--'}</div>
                        </td>
                        <td className="admin-round-cell admin-round-cell-3">
                          <div className="admin-round-score admin-round-score-3">{round3Score > 0 ? round3Score : '--'}</div>
                          <div className="admin-round-time">{round3Score > 0 ? formatTime(round3Time) : '--'}</div>
                        </td>
                        <td className="admin-total-score">
                          {entry.totalScore || 0}
                        </td>
                        <td className="admin-total-time">
                          {formatTime(totalTime)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-edit-btn"
                            onClick={() => openEditModal(entry)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {showEditModal && (
            <div className="admin-edit-modal-overlay">
              <div className="admin-edit-modal">
                <h3 className="admin-form-title">Edit Team</h3>
                <form className="admin-edit-form" onSubmit={handleEditSubmit}>
                  <input className="form-input login-glass-input" name="teamName" value={editForm.teamName} onChange={handleEditFieldChange} placeholder="Team Name" required />
                  <input className="form-input login-glass-input" name="player1Name" value={editForm.player1Name} onChange={handleEditFieldChange} placeholder="Player 1 Name" required />
                  <input className="form-input login-glass-input" name="player2Name" value={editForm.player2Name} onChange={handleEditFieldChange} placeholder="Player 2 Name (Optional)" />
                  <input type="password" className="form-input login-glass-input" name="password" value={editForm.password} onChange={handleEditFieldChange} placeholder="Password (leave blank to keep same)" />

                  <div className="admin-edit-grid">
                    <input type="number" min="0" className="form-input login-glass-input" name="round1Score" value={editForm.round1Score} onChange={handleEditFieldChange} placeholder="Round 1 Score" />
                    <input type="number" min="0" className="form-input login-glass-input" name="round1Time" value={editForm.round1Time} onChange={handleEditFieldChange} placeholder="Round 1 Time" />
                    <input type="number" min="0" className="form-input login-glass-input" name="round2Score" value={editForm.round2Score} onChange={handleEditFieldChange} placeholder="Round 2 Score" />
                    <input type="number" min="0" className="form-input login-glass-input" name="round2Time" value={editForm.round2Time} onChange={handleEditFieldChange} placeholder="Round 2 Time" />
                    <input type="number" min="0" className="form-input login-glass-input" name="round3Score" value={editForm.round3Score} onChange={handleEditFieldChange} placeholder="Round 3 Score" />
                    <input type="number" min="0" className="form-input login-glass-input" name="round3Time" value={editForm.round3Time} onChange={handleEditFieldChange} placeholder="Round 3 Time" />
                    <input type="number" min="0" className="form-input login-glass-input" name="totalScore" value={editForm.totalScore} onChange={handleEditFieldChange} placeholder="Total Score" />
                    <input type="number" min="0" className="form-input login-glass-input" name="totalTime" value={editForm.totalTime} onChange={handleEditFieldChange} placeholder="Total Time" />
                  </div>

                  <div className="admin-edit-grid">
                    <label className="admin-checkbox-row">
                      <input type="checkbox" name="isLoggedIn" checked={editForm.isLoggedIn} onChange={handleEditFieldChange} />
                      <span>isLoggedIn</span>
                    </label>
                    <input type="number" min="1" max="3" className="form-input login-glass-input" name="currentRound" value={editForm.currentRound} onChange={handleEditFieldChange} placeholder="Current Round (1-3)" />
                  </div>

                  {editError && (
                    <div className="error-message premium-glow-text admin-state-message admin-error-message admin-login-error">
                      {editError}
                    </div>
                  )}

                  <div className="admin-edit-actions">
                    <button type="button" className="admin-edit-cancel" onClick={closeEditModal}>Cancel</button>
                    <button type="submit" className="btn btn-golden premium-glow-btn" disabled={editSubmitting}>
                      <span className="btn-text">{editSubmitting ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
