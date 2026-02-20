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

        {/* About Section */}
        <section className="info-section about-section">
          <div className="section-card">
            <h2 className="section-title">About Relic Rush</h2>
            <div className="section-content">
              <p className="section-intro">
                Relic Rush is a story-driven technical event inspired by the Arabian Nights theme.
              </p>
              
              <div className="event-flow">
                <p className="flow-intro">At the start of the event, participants are presented with four digital genie lamps on screen. Among them, only one is the original lamp.</p>
                
                <p className="flow-title">Across three technical rounds:</p>
                <ul className="feature-list">
                  <li>Duplicate lamps are eliminated.</li>
                  <li>Only one lamp remains at the end.</li>
                  <li>The final winning team unlocks the original lamp.</li>
                  <li>A digital genie animation appears with a winning message.</li>
                </ul>
              </div>

              <div className="skills-section">
                <p className="skills-title">The event combines:</p>
                <ul className="skills-list">
                  <li>Logical reasoning</li>
                  <li>Puzzle solving</li>
                  <li>Programming skills</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Rules Section */}
        <section className="info-section rules-section">
          <div className="section-card">
            <h2 className="section-title">Event Rules</h2>
            <div className="section-content">
              <ol className="rules-list">
                <li>Team size is two members. Individual participation is also allowed.</li>
                <li>The event begins with four lamps, among which only one is the original lamp. Each round eliminates one duplicate lamp.</li>
                <li>Round 1 eliminates the first duplicate lamp. Only qualified participants proceed to the next round.</li>
                <li>Round 2 is a one-on-one, clue-based challenge. Using a clue will result in a deduction of 5 points.</li>
                <li>All rounds are strictly time-bound. Answers must be submitted within the given time limit.</li>
                <li>In the final round, the last remaining lamp will glow to reveal the winner. The participant or team with the highest score and least completion time will be declared the winner.</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Lamps removed from home page */}

        <div className="enter-section">
          <button className="btn btn-golden" onClick={handleEnter} style={{ fontSize: '18px', padding: '16px 40px' }}>
            ✨ Enter The Journey ✨
          </button>
        </div>
      </main>
    </>
  )
}
