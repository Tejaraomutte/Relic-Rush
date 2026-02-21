import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [loading, setLoading] = useState(false)

  const showMessage = (text, type) => {
    setMessage(text)
    setMessageType(type)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const trimmedEmail = email.trim()

    setMessage('')

    if (!trimmedEmail || !password) {
      showMessage('Please fill in all fields', 'error')
      return
    }

    setLoading(true)

    try {
      // Accept any email and password for now
      showMessage('Login successful! Redirecting...', 'success')

      localStorage.setItem('user', JSON.stringify({
        email: trimmedEmail,
        name: trimmedEmail.split('@')[0] || 'Player',
        id: trimmedEmail
      }))

      localStorage.setItem('round1Score', '0')
      localStorage.setItem('round2Score', '0')
      localStorage.setItem('round3Score', '0')
      localStorage.setItem('lampsRemaining', '4')

      setTimeout(() => {
        navigate('/home')
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
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                required
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
