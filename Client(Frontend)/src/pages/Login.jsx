import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import { loginUser } from '../utils/api'

export default function Login() {
  const navigate = useNavigate()
  const [teamName, setTeamName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [loading, setLoading] = useState(false)

  const showMessage = (text, type) => {
    setMessage(text)
    setMessageType(type)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const trimmedTeamName = teamName.trim()
    const trimmedPassword = password.trim()

    setMessage('')

    if (!trimmedTeamName || !trimmedPassword) {
      showMessage('Please fill in all fields', 'error')
      return
    }

    setLoading(true)

    try {
      const loginResponse = await loginUser(trimmedTeamName, trimmedPassword)

      showMessage('Login successful! Redirecting...', 'success')

      // Store authentication data
      localStorage.setItem('teamName', loginResponse.teamName)
      localStorage.setItem('token', loginResponse.token)
      localStorage.setItem('role', loginResponse.role || 'participant')
      localStorage.setItem('user', JSON.stringify({
        teamName: loginResponse.teamName,
        name: loginResponse.teamName,
        id: loginResponse._id
      }))

      localStorage.setItem('round1Score', '0')
      localStorage.setItem('round2Score', '0')
      localStorage.setItem('round3Score', '0')
      localStorage.setItem('lampsRemaining', '4')
      localStorage.removeItem('genieRevealPlayed')

      // Redirect based on role
      const redirectPath = loginResponse.role === 'admin' ? '/leaderboard' : '/round1'
      
      setTimeout(() => {
        navigate(redirectPath)
      }, 1500)
    } catch (error) {
      console.error('Login error:', error)
      showMessage(error.message || 'Invalid Team Credentials', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Background />
      <main className="event-container login-container premium-glass-container premium-fade-in">
        <header className="login-header premium-glow-text">
          <h1 className="event-title premium-gold-gradient">RELIC RUSH</h1>
          <p className="event-subtitle premium-glow-text">Enter Your Details</p>
        </header>

        <div className="login-card premium-glass-card">
          {message && (
            <div className={`form-message ${messageType} visible premium-glow-text`}>
              {message}
            </div>
          )}

          <form className="login-form premium-glass-form" onSubmit={handleSubmit}>
            <div className="form-group premium-glass-card">
              <label className="form-label premium-glow-text">Team Name</label>
              <input
                type="text"
                placeholder="Enter your team name"
                required
                className="form-input premium-glass-input"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <div className="form-group premium-glass-card">
              <label className="form-label premium-glow-text">Password</label>
              <div className="password-field premium-glass-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  className="form-input premium-glass-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle premium-glow-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-golden btn-full premium-glow-btn" disabled={loading}>
              <span className="btn-text">{loading ? 'Loading...' : 'Begin Your Journey'}</span>
              <span className="btn-glow"></span>
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
