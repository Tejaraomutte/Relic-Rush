import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'

export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleEnter = () => {
    if (user) {
      navigate('/round1')
    } else {
      navigate('/login')
    }
  }

  return (
    <>
      <Background />
      <main className="event-container">
        <header className="home-header">
          <h1 className="event-title">RELIC RUSH</h1>
          <p className="event-subtitle">Find the True Relic Among the Fakes</p>
          <p className="event-description">A mystical journey through Arabian Nights</p>
        </header>

        <div className="lamps-container">
          {[1, 2, 3, 4].map((lampNum) => (
            <div key={lampNum} className="lamp-wrapper">
              <div className="lamp genie-lamp" style={{ animationDelay: `${(lampNum - 1) * 0.15}s` }}>
                <div className="lamp-body"></div>
                <div className="lamp-spout"></div>
                <div className="lamp-handle"></div>
                <div className="genie-smoke"></div>
              </div>
              <p className="lamp-label">Lamp {lampNum}</p>
            </div>
          ))}
        </div>

        <div className="enter-section">
          <button className="btn btn-golden" onClick={handleEnter} style={{ fontSize: '18px', padding: '16px 40px' }}>
            ✨ Enter The Journey ✨
          </button>
        </div>
      </main>
    </>
  )
}
