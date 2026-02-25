import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import GenieRevealOverlay from '../components/GenieRevealOverlay'
import lamp from '../assets/images/lamp.jpeg'
import { getLeaderboard } from '../utils/api'
import { triggerGenieReveal } from '../utils/roundFlow'
import './Results.css'

const API_URL = 'http://localhost:5000'

/* ─── Reveal helper ─── */
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

/* ─── Particles ─── */
function Particles() {
  return (
    <div className="res-particles" aria-hidden="true">
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className="res-particle" style={{
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

/* ═══════════════════════════════════════════
   SVG CHART COMPONENTS (zero dependencies)
   ═══════════════════════════════════════════ */

/* ─── Circular Progress Ring ─── */
function ScoreRing({ score, maxScore = 100, size = 160, strokeWidth = 10, label }) {
  const pct = Math.min((score / maxScore) * 100, 100)
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="chart-ring-wrap">
      <svg width={size} height={size} className="chart-ring-svg">
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,215,0,0.08)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="url(#ringGrad)" strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          className="chart-ring-progress"
          style={{ '--target-offset': offset }} />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#00D9FF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="chart-ring-center">
        <span className="chart-ring-value">{score}</span>
        <span className="chart-ring-label">{label || 'Points'}</span>
      </div>
    </div>
  )
}

/* ─── Animated Bar Chart ─── */
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="chart-bar-container">
      {data.map((d, i) => (
        <div key={i} className="chart-bar-item">
          <div className="chart-bar-track">
            <div className="chart-bar-fill"
              style={{
                '--bar-pct': `${(d.value / max) * 100}%`,
                '--bar-delay': `${i * 200}ms`,
                background: d.color || 'linear-gradient(180deg, #FFD700, #E8A800)'
              }} />
          </div>
          <span className="chart-bar-val">{d.value}</span>
          <span className="chart-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Radar / Spider Chart ─── */
function RadarChart({ data, size = 200 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38
  const n = data.length
  const angleStep = (2 * Math.PI) / n

  const getPoint = (i, val) => {
    const a = angleStep * i - Math.PI / 2
    const dist = (val / 100) * r
    return { x: cx + dist * Math.cos(a), y: cy + dist * Math.sin(a) }
  }

  // grid rings
  const rings = [0.25, 0.5, 0.75, 1]
  const gridLines = data.map((_, i) => {
    const a = angleStep * i - Math.PI / 2
    return { x2: cx + r * Math.cos(a), y2: cy + r * Math.sin(a) }
  })
  const points = data.map((d, i) => getPoint(i, d.value))
  const poly = points.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <div className="chart-radar-wrap">
      <svg width={size} height={size} className="chart-radar-svg">
        {rings.map((s, i) => (
          <polygon key={i}
            points={data.map((_, j) => {
              const a = angleStep * j - Math.PI / 2
              return `${cx + r * s * Math.cos(a)},${cy + r * s * Math.sin(a)}`
            }).join(' ')}
            fill="none" stroke="rgba(255,215,0,0.08)" strokeWidth="1" />
        ))}
        {gridLines.map((l, i) => (
          <line key={i} x1={cx} y1={cy} x2={l.x2} y2={l.y2}
            stroke="rgba(255,215,0,0.06)" strokeWidth="1" />
        ))}
        <polygon points={poly}
          fill="rgba(255,215,0,0.12)" stroke="#FFD700" strokeWidth="2"
          className="chart-radar-area" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4"
            fill="#FFD700" stroke="#0a0d14" strokeWidth="2"
            className="chart-radar-dot" />
        ))}
        {data.map((d, i) => {
          const a = angleStep * i - Math.PI / 2
          const lx = cx + (r + 22) * Math.cos(a)
          const ly = cy + (r + 22) * Math.sin(a)
          return (
            <text key={i} x={lx} y={ly}
              textAnchor="middle" dominantBaseline="central"
              className="chart-radar-label">{d.label}</text>
          )
        })}
      </svg>
    </div>
  )
}

/* ─── Achievement Badge ─── */
function AchievementBadge({ icon, title, desc, unlocked }) {
  return (
    <div className={`res-badge-card ${unlocked ? 'unlocked' : 'locked'}`}>
      <span className="res-badge-icon">{icon}</span>
      <strong className="res-badge-title">{title}</strong>
      <p className="res-badge-desc">{desc}</p>
      {!unlocked && <div className="res-badge-lock">🔒</div>}
    </div>
  )
}

/* ─── Medal helper ─── */
function getMedal(rank) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return null
}

/* ═══════════════════════════════════════════
   MAIN RESULTS COMPONENT
   ═══════════════════════════════════════════ */
export default function Results({ lampsRemaining = 1 }) {
  const navigate = useNavigate()
  const location = useLocation()
  const mode = location.state?.mode || 'final'
  const resultData = location.state?.resultData || null
  const isRound1Mode = mode === 'round1'
  const isRound2Mode = mode === 'round2'
  const isFinalMode = mode === 'final'
  const isWinnerFromState = Boolean(resultData?.isWinner)

  const [round1Score, setRound1Score] = useState(0)
  const [round2Score, setRound2Score] = useState(0)
  const [round3Score, setRound3Score] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])
  const [revealActive, setRevealActive] = useState(false)
  const [interactionLocked, setInteractionLocked] = useState(false)
  const [revealPlayed, setRevealPlayed] = useState(() => localStorage.getItem('genieRevealPlayed') === 'true')
  const [showRelicStory, setShowRelicStory] = useState(false)
  const finalSubmittedRef = useRef(false)
  const revealTriggeredRef = useRef(false)

  useEffect(() => {
    const r1 = parseInt(localStorage.getItem('round1Score')) || 0
    const r2 = parseInt(localStorage.getItem('round2Score')) || 0
    const r3 = parseInt(localStorage.getItem('round3Score')) || 0
    const total = r1 + r2 + r3
    setRound1Score(r1)
    setRound2Score(r2)
    setRound3Score(r3)
    setTotalScore(total)

    if (isFinalMode && !finalSubmittedRef.current) {
      finalSubmittedRef.current = true
      loadLeaderboard()
      submitFinalScore(r1, r2, r3, total)
    }
    if (isFinalMode && isWinnerFromState && !revealPlayed && !revealTriggeredRef.current) {
      revealTriggeredRef.current = true
      triggerGenieReveal({ setRevealActive, setInteractionLocked, setRevealPlayed })
    }
  }, [navigate, isFinalMode, isWinnerFromState, revealPlayed])

  useEffect(() => {
    if (revealPlayed) localStorage.setItem('genieRevealPlayed', 'true')
  }, [revealPlayed])

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard()
      setLeaderboard(data.slice(0, 10) || [])
    } catch (e) { console.error('Error loading leaderboard:', e) }
  }

  const submitFinalScore = async (r1, r2, r3, total) => {
    const user = JSON.parse(localStorage.getItem('user'))
    try {
      await fetch(`${API_URL}/submit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: user.teamName, round: 'final', score: total, round1: r1, round2: r2, round3: r3 })
      })
    } catch (e) { console.error('Error submitting final score:', e) }
  }

  const handleHome = () => {
    ;['user', 'round1Score', 'round2Score', 'round3Score', 'lampsRemaining', 'genieRevealPlayed']
      .forEach(k => localStorage.removeItem(k))
    navigate('/')
  }

  const handleShare = () => {
    const text = `🎉 I found the True Relic in Relic Rush!\n\nMy Final Score: ${totalScore}\n- Round 1: ${round1Score}\n- Round 2: ${round2Score}\n- Round 3: ${round3Score}\n\nCan you beat my score? 🧞‍♂️`
    navigator.share ? navigator.share({ title: 'Relic Rush', text }) : alert(text)
  }

  const resolvedScore = resultData?.score ?? (isFinalMode ? totalScore : isRound2Mode ? round2Score : round1Score)
  const resolvedTimeTaken = resultData?.timeTakenSeconds
  const resolvedQualification = resultData?.qualificationStatus || (isFinalMode ? (isWinnerFromState ? 'Qualified' : 'Not Qualified') : 'Qualified')
  const maxPossible = isFinalMode ? 300 : 100

  // Chart data
  const barData = [
    { label: 'R1', value: round1Score, color: 'linear-gradient(180deg, #FFD700, #B8860B)' },
    ...(!isRound1Mode ? [{ label: 'R2', value: round2Score, color: 'linear-gradient(180deg, #00D9FF, #0099CC)' }] : []),
    ...(isFinalMode ? [{ label: 'R3', value: round3Score, color: 'linear-gradient(180deg, #c084fc, #7c3aed)' }] : []),
  ]

  const radarData = [
    { label: 'Speed', value: resolvedTimeTaken ? Math.max(100 - resolvedTimeTaken, 10) : 60 },
    { label: 'R1', value: Math.min(round1Score * 2, 100) },
    { label: 'Accuracy', value: Math.min(resolvedScore / (maxPossible / 100), 100) },
    { label: 'R2', value: Math.min(round2Score * 2, 100) },
    { label: 'R3', value: isFinalMode ? Math.min(round3Score * 2, 100) : 0 },
  ]

  // Achievements
  const achievements = [
    { icon: '⚡', title: 'Speed Demon', desc: 'Finished under 60 seconds', unlocked: resolvedTimeTaken != null && resolvedTimeTaken < 60 },
    { icon: '🎯', title: 'Precision', desc: 'Scored above 80%', unlocked: resolvedScore >= maxPossible * 0.8 },
    { icon: '🏺', title: 'Relic Finder', desc: 'Completed all rounds', unlocked: isFinalMode },
    { icon: '🧞', title: 'Genie Master', desc: 'Won the final challenge', unlocked: isFinalMode && isWinnerFromState },
    { icon: '🔥', title: 'Hat Trick', desc: 'Scored in all 3 rounds', unlocked: isFinalMode && round1Score > 0 && round2Score > 0 && round3Score > 0 },
    { icon: '💎', title: 'Diamond', desc: 'Perfect total score', unlocked: isFinalMode && totalScore >= maxPossible },
  ]

  const modeLabel = isRound1Mode ? 'Round 1' : isRound2Mode ? 'Round 2' : 'Final'
  const modeTitle = isRound1Mode ? 'Round 1 Complete' : isRound2Mode ? 'Round 2 Complete' : "Journey's End"
  const modeSub = isRound1Mode
    ? 'Review your score, then proceed to the next challenge.'
    : isRound2Mode
      ? 'Round 2 completed! Ready for the final challenge?'
      : 'Your quest through the sands of time has concluded.'

  return (
    <>
      <Background />
      <Particles />

      <main className={`res-page ${interactionLocked ? 'interaction-locked' : ''}`}>

        {/* ═══ HEADER ═══ */}
        <Reveal>
          <header className="res-header">
            <span className="res-tag">📜 {modeLabel} Results</span>
            <h1 className="res-title">
              {modeTitle.split(' ').map((w, i, arr) =>
                i === arr.length - 1
                  ? <span key={i} className="res-gradient-text">{w}</span>
                  : <span key={i}>{w} </span>
              )}
            </h1>
            <p className="res-subtitle">{modeSub}</p>
          </header>
        </Reveal>

        {/* ═══ HERO: RING + LAMP + QUICK STATS ═══ */}
        <Reveal delay={150}>
          <div className="res-hero-row">
            <div className="res-hero-ring">
              <ScoreRing score={resolvedScore} maxScore={maxPossible} size={180} strokeWidth={12} label="Total Score" />
            </div>
            <div className="res-hero-lamp">
              <div className={`res-lamp-wrap ${isFinalMode && isWinnerFromState ? 'genie-ready' : ''}`}>
                <img src={lamp} alt="Relic lamp" className="res-lamp-img" />
                <div className="res-lamp-glow" />
              </div>
            </div>
            <div className="res-hero-quick">
              <div className="res-quick-item">
                <span className="res-quick-label">Time</span>
                <span className="res-quick-value">{typeof resolvedTimeTaken === 'number' ? `${resolvedTimeTaken}s` : '—'}</span>
              </div>
              <div className="res-quick-item">
                <span className="res-quick-label">Status</span>
                <span className={`res-quick-value res-status ${resolvedQualification === 'Qualified' ? 'qualified' : 'not-qualified'}`}>
                  {resolvedQualification}
                </span>
              </div>
              <div className="res-quick-item">
                <span className="res-quick-label">Lamps Left</span>
                <span className="res-quick-value">{lampsRemaining} 🏺</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ═══ CHARTS ROW ═══ */}
        <Reveal delay={300}>
          <div className="res-charts-row">
            <div className="res-chart-card">
              <h3 className="res-chart-title">Round Scores</h3>
              <BarChart data={barData} />
            </div>
            {isFinalMode && (
              <div className="res-chart-card">
                <h3 className="res-chart-title">Performance Radar</h3>
                <RadarChart data={radarData} size={220} />
              </div>
            )}
          </div>
        </Reveal>

        {/* ═══ ROUND BREAKDOWN CARDS ═══ */}
        <Reveal delay={400}>
          <div className="res-breakdown">
            <h3 className="res-breakdown-title">Round Breakdown</h3>
            <div className="res-breakdown-grid">
              {barData.map((d, i) => (
                <div key={i} className="res-round-stat">
                  <span className="res-round-stat-icon">{['🏺', '🔍', '✨'][i]}</span>
                  <span className="res-round-stat-label">{['Round 1', 'Round 2', 'Round 3'][i]}</span>
                  <span className="res-round-stat-value">{d.value}</span>
                  <div className="res-round-stat-bar">
                    <div className="res-round-stat-bar-fill" style={{ width: `${(d.value / Math.max(...barData.map(b => b.value), 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
              {isFinalMode && (
                <div className="res-round-stat res-round-stat-total">
                  <span className="res-round-stat-icon">🏆</span>
                  <span className="res-round-stat-label">Total</span>
                  <span className="res-round-stat-value">{totalScore}</span>
                  <div className="res-round-stat-bar total-bar">
                    <div className="res-round-stat-bar-fill" style={{ width: `${(totalScore / maxPossible) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* ═══ ACHIEVEMENTS ═══ */}
        <Reveal delay={450}>
          <div className="res-achievements">
            <h3 className="res-achievements-title">
              <span className="res-gradient-text">Achievements</span> Unlocked
            </h3>
            <div className="res-achievements-grid">
              {achievements.map((a, i) => (
                <AchievementBadge key={i} {...a} />
              ))}
            </div>
          </div>
        </Reveal>

        {/* ═══ LEADERBOARD ═══ */}
        {isFinalMode && (
          <Reveal delay={500}>
            <div className="res-leaderboard">
              <h3 className="res-leaderboard-heading">
                <span className="res-gradient-text">Top 10</span> Champions
              </h3>
              {leaderboard.length === 0 ? (
                <p className="res-empty-msg">No scores yet. Be the first to conquer!</p>
              ) : (
                <div className="res-leaderboard-list">
                  {leaderboard.map((entry, index) => (
                    <div key={index} className={`res-lb-row ${index < 3 ? 'res-lb-top' : ''}`}>
                      <div className="res-lb-rank">
                        {getMedal(index + 1) || <span className="res-lb-rank-num">{index + 1}</span>}
                      </div>
                      <div className="res-lb-name">{entry.teamName || entry.name || entry.email}</div>
                      <div className="res-lb-score">{entry.totalScore || 0}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        )}

        {/* ═══ RELIC HIDDEN ═══ */}
        {isFinalMode && !isWinnerFromState && (
          <Reveal delay={550}>
            <div className="res-hidden-msg"><span>🌙</span> The relic remains hidden…</div>
          </Reveal>
        )}

        {/* ═══ ACTIONS ═══ */}
          <Reveal delay={600}>
            <div className="res-actions">
              <button
                className="res-btn res-btn-gold"
                onClick={() => navigate('/relic-story')}
                style={{ minWidth: 180 }}
              >
                View Lamp
              </button>
              {isRound1Mode && <button className="res-btn res-btn-accent" onClick={() => navigate('/round2')}>Next Round →</button>}
              {isRound2Mode && <button className="res-btn res-btn-accent" onClick={() => navigate('/round3')}>Enter Round 3 →</button>}
              {/* {isFinalMode && <button className="res-btn res-btn-ghost" onClick={handleShare}>Share Score</button>} */}
            </div>
          </Reveal>

      </main>

      <GenieRevealOverlay
        active={isFinalMode && isWinnerFromState && revealActive}
        onComplete={() => { setRevealActive(false); setInteractionLocked(false); setRevealPlayed(true) }}
      />
    </>
  )
}
