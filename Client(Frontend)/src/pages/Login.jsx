import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'

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
      const normalizedTeamName = trimmedTeamName.replace(/\s+/g, '')
      const normalizedPassword = trimmedPassword.replace(/\s+/g, '')
      const expectedPassword = `${normalizedTeamName}@relic`

      if (normalizedPassword.toLowerCase() !== expectedPassword.toLowerCase()) {
        showMessage('Invalid Team Credentials', 'error')
        return
      }

      showMessage('Login successful! Redirecting...', 'success')

      localStorage.setItem('teamName', trimmedTeamName)
      localStorage.setItem('user', JSON.stringify({
        email: trimmedTeamName,
        name: trimmedTeamName,
        id: trimmedTeamName
      }))

      localStorage.setItem('round1Score', '0')
      localStorage.setItem('round2Score', '0')
      localStorage.setItem('round3Score', '0')
      localStorage.setItem('lampsRemaining', '4')
      localStorage.removeItem('genieRevealPlayed')

      setTimeout(() => {
        navigate('/round1')
      }, 1500)
    } catch (error) {
      console.error('Login error:', error)
      showMessage('An error occurred. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Background />
      <main className="event-container login-container">
        <header className="login-header">
          <h1 className="event-title">RELIC RUSH</h1>
          <p className="event-subtitle">Enter Your Details</p>
        </header>

        <div className="login-card">
          {message && (
            <div className={`form-message ${messageType} visible`}>
              {message}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Team Name</label>
              <input
                type="text"
                placeholder="Enter your team name"
                required
                className="form-input"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-golden btn-full" disabled={loading}>
              <span className="btn-text">{loading ? 'Loading...' : 'Begin Your Journey'}</span>
              <span className="btn-glow"></span>
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
