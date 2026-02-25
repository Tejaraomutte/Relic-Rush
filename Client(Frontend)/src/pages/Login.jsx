import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Login.css'
import LoginParticles from '../components/LoginParticles'
import { loginUser } from '../utils/api'

export default function Login() {
  const navigate = useNavigate()

  const [teamName, setTeamName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [loading, setLoading] = useState(false)

  const lampRef = useRef(null)
  const [lampGlow, setLampGlow] = useState(0.6)

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

      localStorage.setItem('teamName', loginResponse.teamName)
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

      setTimeout(() => {
        navigate('/round1')
      }, 1500)

    } catch (error) {
      console.error('Login error:', error)
      showMessage(error.message || 'Invalid Team Credentials', 'error')
    } finally {
      setLoading(false)
    }
  }

  // 🔥 Smooth Lamp Glow Effect
  useEffect(() => {
    let frame

    function handleMove(e) {
      if (!lampRef.current) return

      cancelAnimationFrame(frame)

      frame = requestAnimationFrame(() => {
        const rect = lampRef.current.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2

        const dx = e.clientX - cx
        const dy = e.clientY - cy

        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxDist = window.innerWidth * 0.35

        let intensity = 1 - Math.min(dist / maxDist, 1)
        intensity = intensity * intensity // easing curve

        const newGlow = 0.5 + intensity * 1.4

        setLampGlow(prev =>
          prev + (newGlow - prev) * 0.08
        )
      })
    }

    window.addEventListener('mousemove', handleMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="login-bg">

      <LoginParticles />

      <div className="login-overlay" />

      <main className="event-container login-container login-glass premium-fade-in">

        <header className="login-header login-glow-text">
          <h1
            className="event-title login-gold-gradient cinematic-title-entrance slow-fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            RELIC RUSH
          </h1>

          <p
            className="event-subtitle login-glow-text cinematic-subtitle-entrance slow-fade-in"
            style={{ animationDelay: '1.1s' }}
          >
            Enter Your Details
          </p>
        </header>

        {/* Lamp Portal */}
        <div
          className="lamp-portal-center slow-fade-in"
          style={{ animationDelay: '1.7s' }}
        >
          <svg
            ref={lampRef}
            width="120"
            height="70"
            viewBox="0 0 120 70"
            className="lamp-svg"
          >
            <defs>
              <radialGradient id="lamp-glow" cx="50%" cy="60%" r="60%">
                <stop
                  offset="0%"
                  stopColor="#fffbe9"
                  stopOpacity={lampGlow * 0.8}
                />
                <stop
                  offset="80%"
                  stopColor="#D4AF37"
                  stopOpacity={lampGlow * 0.35}
                />
                <stop
                  offset="100%"
                  stopColor="#D4AF37"
                  stopOpacity="0"
                />
              </radialGradient>
            </defs>

            <ellipse
              cx="60"
              cy="60"
              rx="48"
              ry="18"
              fill="url(#lamp-glow)"
              filter="blur(10px)"
            />

            <ellipse
              cx="60"
              cy="60"
              rx="32"
              ry="10"
              fill="#D4AF37"
              opacity="0.2"
            />

            <path
              d="M20 60 Q60 10 100 60 Q80 65 60 60 Q40 65 20 60 Z"
              fill="#D4AF37"
              stroke="#bfa14a"
              strokeWidth="2"
            />

            <ellipse
              cx="60"
              cy="60"
              rx="18"
              ry="6"
              fill="#fffbe9"
              opacity="0.25"
            />
          </svg>
        </div>

        {/* Login Card */}
        <div
          className="login-card login-glass-card cinematic-card-entrance slow-fade-in"
          style={{ animationDelay: '2.2s' }}
        >

          {message && (
            <div className={`form-message ${messageType} visible login-glow-text`}>
              {message}
            </div>
          )}

          <form
            className="login-form login-glass-form"
            onSubmit={handleSubmit}
          >

            <div
              className="form-group cinematic-field-entrance slow-fade-in"
              style={{ animationDelay: '2.6s' }}
            >
              <label className="form-label login-glow-text">
                Team Name
              </label>

              <input
                type="text"
                placeholder="Enter your team name"
                required
                className="form-input login-glass-input"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <div
              className="form-group cinematic-field-entrance slow-fade-in"
              style={{ animationDelay: '2.8s' }}
            >
              <label className="form-label login-glow-text">
                Password
              </label>

              <div className="password-field login-glass-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  className="form-input login-glass-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="password-toggle login-glow-btn"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-golden btn-full login-glow-btn cinematic-btn-entrance slow-fade-in"
              style={{ animationDelay: '3.1s' }}
              disabled={loading}
            >
              <span className="btn-text">
                {loading ? 'Loading...' : 'Begin Your Journey'}
              </span>
              <span className="btn-glow"></span>
            </button>

          </form>
        </div>

      </main>
    </div>
  )
}