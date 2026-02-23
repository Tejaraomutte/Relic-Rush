import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import ActionButtons from '../components/ActionButtons'

export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      navigate('/login')
    }
  }, [navigate])

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
      <main className="event-container premium-glass-container premium-fade-in">
        <header className="home-header premium-glow-text">
          <h1 className="event-title premium-gold-gradient">RELIC RUSH</h1>
          <p className="event-subtitle premium-glow-text">Find the True Relic Among the Fakes</p>
          <p className="event-description premium-glass-card">A mystical journey through Arabian Nights</p>
        </header>

        <section className="info-section about-section premium-glass-card">
          <div className="section-card">
            <h2 className="section-title premium-gold-gradient">About Relic Rush</h2>
            <div className="section-content">
              <p className="section-intro premium-glow-text">
                Relic Rush is a story-driven technical event inspired by the Arabian Nights theme.
              </p>
              <div className="event-flow premium-glass-card">
                <p className="flow-intro premium-glow-text">At the start of the event, participants are presented with four digital genie lamps on screen. Among them, only one is the original lamp.</p>
                <p className="flow-title premium-gold-gradient">Across three technical rounds:</p>
                <ul className="feature-list premium-glass-list">
                  <li>Duplicate lamps are eliminated.</li>
                  <li>Only one lamp remains at the end.</li>
                  <li>The final winning team unlocks the original lamp.</li>
                  <li>A digital genie animation appears with a winning message.</li>
                </ul>
              </div>
              <div className="skills-section premium-glass-card">
                <p className="skills-title premium-glow-text">The event combines:</p>
                <ul className="skills-list premium-glass-list">
                  <li>Logical reasoning</li>
                  <li>Puzzle solving</li>
                  <li>Programming skills</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="info-section rules-section premium-glass-card">
          <div className="section-card">
            <h2 className="section-title premium-gold-gradient">Event Rules</h2>
            <div className="section-content">
              <ol className="rules-list premium-glass-list">
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

        <ActionButtons
          buttons={[{
            label: 'Start Round 1',
            variant: 'btn-golden btn-large premium-glow-btn',
            onClick: handleEnter
          }]}
        />
      </main>
    </>
  )
}
