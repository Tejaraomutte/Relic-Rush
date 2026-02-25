import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import kalyanImg from '../assets/images/coordinator.webp'
import tejaImg from '../assets/images/coordinator.webp'
import madhaviImg from '../assets/images/coordinator.webp'
import lampImg from '../assets/images/lamp1.png'
import './Home.css'

/* ─── tiny helper: reveal-on-scroll ─── */
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('revealed'); obs.unobserve(el) } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useReveal()
  return (
    <div ref={ref} className={`reveal-on-scroll ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/* ─── floating particles (pure CSS-driven) ─── */
function Particles() {
  return (
    <div className="saas-particles" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="saas-particle" style={{
          '--x': `${Math.random() * 100}%`,
          '--y': `${Math.random() * 100}%`,
          '--size': `${2 + Math.random() * 4}px`,
          '--dur': `${6 + Math.random() * 10}s`,
          '--delay': `${Math.random() * 8}s`,
        }} />
      ))}
    </div>
  )
}

/* ─── data ─── */
const ROUNDS = [
  {
    num: '01',
    title: 'The Lamp Selection',
    desc: 'Solve MCQ challenges to eliminate the first duplicate lamp. Speed and accuracy matter — only top scorers advance.',
    icon: '🏺',
  },
  {
    num: '02',
    title: 'Clue Quest',
    desc: 'A 1v1 puzzle-based round with optional clues. Using a clue costs 5 points — risk vs. reward is yours to decide.',
    icon: '🔍',
  },
  {
    num: '03',
    title: 'The Final Relic',
    desc: 'Debug, decode, and conquer the final challenge. The last lamp glows for the champion who proves worthy.',
    icon: '✨',
  },
]

const RULES = [
  { icon: '👥', text: 'Team size is two members. Individual participation is also allowed.' },
  { icon: '🏺', text: 'The event begins with four lamps — only one is the original. Each round eliminates one duplicate.' },
  { icon: '⚔️', text: 'Round 1 eliminates the first duplicate lamp. Only qualified participants proceed.' },
  { icon: '🔑', text: 'Round 2 is a 1-on-1, clue-based challenge. Using a clue deducts 5 points.' },
  { icon: '⏳', text: 'All rounds are strictly time-bound. Submit within the time limit.' },
  { icon: '🏆', text: 'The final winning team unlocks the original lamp. Highest score + least time wins.' },
]

const STATS = [
  { value: '3', label: 'Rounds' },
  { value: '4', label: 'Lamps' },
  { value: '1', label: 'True Relic' },
  { value: '∞', label: 'Glory' },
]

const TEAM = [
  { name: 'Kalyan', role: 'Tech Coordinator', img: kalyanImg },
  { name: 'Teja Sathvika', role: 'Tech Coordinator', img: tejaImg },
  { name: 'Madhavi', role: 'Tech Coordinator', img: madhaviImg },
]

export default function Home() {
  const handleStartJourney = () => {
    localStorage.setItem('storyUnlocked', 'true')
    navigate('/story')
  }
  const navigate = useNavigate()

  /* ─── Navbar scroll shadow ─── */
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <Background />
      <Particles />

      {/* ══════════ NAVBAR ══════════ */}
      <nav className={`saas-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="saas-nav-inner">
          <span className="saas-nav-brand">⚱️ Relic Rush</span>
          <div className="saas-nav-links">
            <a href="#about">About</a>
            <a href="#rounds">Rounds</a>
            <a href="#rules">Rules</a>
            <a href="#team">Team</a>
          </div>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className="saas-hero">
        <div className="saas-hero-content">
          <Reveal>
            <span className="saas-badge">🏛️ Arabian Nights × Tech Arena</span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="saas-hero-title">
              Find the <span className="saas-gradient-text">True Relic</span><br />
              Among the Fakes
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="saas-hero-sub">
              A story-driven technical event where logic, puzzles, and code
              collide in a mystical quest through the sands of time.
            </p>
          </Reveal>


          {/* stats strip */}
          <Reveal delay={480}>
            <div className="saas-stats-strip">
              {STATS.map((s, i) => (
                <div key={i} className="saas-stat">
                  <span className="saas-stat-val">{s.value}</span>
                  <span className="saas-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* decorative lamp */}
        <div className="saas-hero-visual">
          <Reveal delay={300}>
            <div className="saas-lamp-wrapper">
              <img src={lampImg} alt="Mystical lamp" className="saas-lamp-img" />
              <div className="saas-lamp-glow" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ ABOUT ══════════ */}
      <section className="saas-section" id="about">
        <Reveal>
          <span className="saas-section-tag">About</span>
          <h2 className="saas-section-heading">
            The Legend of <span className="saas-gradient-text">Relic Rush</span>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="saas-section-desc">
            Participants are presented with four digital genie lamps — but only one is the original.
            Across three intense technical rounds, duplicate lamps are eliminated one by one.
            The final team to survive unlocks the true lamp, triggering a legendary genie reveal.
          </p>
        </Reveal>

        <div className="saas-about-grid">
          <Reveal delay={200}>
            <div className="saas-about-card">
              <span className="saas-about-icon">🧠</span>
              <h3>Logical Reasoning</h3>
              <p>Sharpen your mind with puzzles that push your analytical limits.</p>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <div className="saas-about-card">
              <span className="saas-about-icon">🧩</span>
              <h3>Puzzle Solving</h3>
              <p>Decode clues, crack patterns, and navigate through riddles.</p>
            </div>
          </Reveal>
          <Reveal delay={440}>
            <div className="saas-about-card">
              <span className="saas-about-icon">💻</span>
              <h3>Programming</h3>
              <p>Debug code, write logic, and prove your dev skills under pressure.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ ROUNDS ══════════ */}
      <section className="saas-section" id="rounds">
        <Reveal>
          <span className="saas-section-tag">Event Flow</span>
          <h2 className="saas-section-heading">
            Three Rounds. <span className="saas-gradient-text">One Champion.</span>
          </h2>
        </Reveal>

        <div className="saas-rounds-timeline">
          {ROUNDS.map((r, i) => (
            <Reveal key={i} delay={i * 180}>
              <div className="saas-round-card">
                <div className="saas-round-num">{r.num}</div>
                <div className="saas-round-icon">{r.icon}</div>
                <h3 className="saas-round-title">{r.title}</h3>
                <p className="saas-round-desc">{r.desc}</p>
                {i < ROUNDS.length - 1 && <div className="saas-round-connector" />}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════ RULES ══════════ */}
      <section className="saas-section" id="rules">
        <Reveal>
          <span className="saas-section-tag">Rules & Guidelines</span>
          <h2 className="saas-section-heading">
            Know the <span className="saas-gradient-text">Rules</span>
          </h2>
          <p className="saas-section-desc">
            Every great quest has its code of honor. Read carefully before you enter the arena.
          </p>
        </Reveal>

        <div className="saas-rules-list">
          {RULES.map((rule, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="saas-rule-item">
                <div className="saas-rule-accent" />
                <div className="saas-rule-num-badge">
                  <span className="saas-rule-num">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="saas-rule-body">
                  <span className="saas-rule-icon">{rule.icon}</span>
                  <p>{rule.text}</p>
                </div>
                <div className="saas-rule-shimmer" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════ TEAM ══════════ */}
      <section className="saas-section" id="team">
        <Reveal>
          <span className="saas-section-tag">Team</span>
          <h2 className="saas-section-heading">
            Guardians of the <span className="saas-gradient-text">Relic Realm</span>
          </h2>
        </Reveal>

        <div className="saas-team-grid">
          {TEAM.map((t, i) => (
            <Reveal key={i} delay={i * 160}>
              <div className="saas-team-card">
                <div className="saas-team-img-wrap">
                  <img src={t.img} alt={t.name} className="saas-team-img" />
                  <div className="saas-team-ring" />
                </div>
                <h3 className="saas-team-name">{t.name}</h3>
                <p className="saas-team-role">{t.role}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>


      {/* ══════════ FINAL CTA ══════════ */}
      <section className="saas-cta-section">
        <Reveal>
          <h2 className="saas-cta-heading">
            The Lamps Await. The <span className="saas-gradient-text">Genie</span> Stirs.
          </h2>
          <p className="saas-cta-sub">
            A legendary quest of logic, code, and courage — may the worthy prevail.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
            <button
              className="btn btn-golden btn-large premium-glow-btn"
              onClick={handleStartJourney}
            >
              Start Journey
            </button>
          </div>
        </Reveal>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="saas-footer">
        <p>© 2026 Relic Rush — Crafted with ✨ for the ultimate tech quest</p>
      </footer>
    </>
  )
}