import { useState, useRef, useCallback, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import Confetti from '../components/Confetti'

const SESSION_MAX = 50
const POINTS_PER_CLICKS = 10
const SECRET_CLICK_COUNT = 100

export default function Clicker() {
  const { addPoints, showSecret } = useGame()
  const [clicks, setClicks] = useState(0)
  const [sessionPts, setSessionPts] = useState(0)
  const [ripples, setRipples] = useState([])
  const [confetti, setConfetti] = useState(false)
  const [secretTriggered, setSecretTriggered] = useState(false)
  const [done, setDone] = useState(false)
  const totalClicksRef = useRef(0) // for secret tracking (hidden)
  const btnRef = useRef(null)

  const handleClick = useCallback((e) => {
    if (done) return

    // Ripple animation
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const x = (e.clientX || rect.left + rect.width / 2) - rect.left
      const y = (e.clientY || rect.top + rect.height / 2) - rect.top
      const id = Date.now() + Math.random()
      setRipples(r => [...r, { id, x, y }])
      setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600)
    }

    const newClicks = clicks + 1
    setClicks(newClicks)

    totalClicksRef.current += 1

    // Award point every 10 clicks
    if (newClicks % POINTS_PER_CLICKS === 0 && sessionPts < SESSION_MAX) {
      const earned = 1
      setSessionPts(p => p + earned)
      addPoints(earned, 'clicker')
    }

    // Cap at 500 clicks earning (50pts)
    if (sessionPts >= SESSION_MAX && !done) {
      setDone(true)
    }

    // Secret 3: exactly 100 total hidden clicks
    if (totalClicksRef.current === SECRET_CLICK_COUNT && !secretTriggered) {
      setSecretTriggered(true)
      addPoints(500, 'clicker_secret')
      setConfetti(true)
      showSecret("The Queen cheats.\nAnd she deserves it. 👑\n+500 Bonus Coins!")
    }
  }, [clicks, sessionPts, done, secretTriggered, addPoints, showSecret])

  function resetSession() {
    setClicks(0)
    setSessionPts(0)
    setDone(false)
  }

  const progress = Math.min((sessionPts / SESSION_MAX) * 100, 100)

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      {confetti && <Confetti active onDone={() => setConfetti(false)} />}

      <div className="ph">
        <h1 className="ph-title">👆 The Royal Clicker</h1>
        <p className="ph-sub">Click the throne. Earn 1 coin per 10 clicks. Max 50 per session.</p>
      </div>

      <div className="card" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--font-h)', color: 'var(--cream-d)', fontSize: '0.8rem', marginBottom: '0.3rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Session Coins
        </div>
        <div style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)', fontSize: '2.5rem', fontWeight: 900 }}>
          🪙 {sessionPts} / {SESSION_MAX}
        </div>
        <div style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.08)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--gold-dim), var(--gold))', width: `${progress}%`, transition: 'width 0.3s ease', borderRadius: 999 }} />
        </div>
        <div style={{ color: 'var(--cream-d)', fontSize: '0.78rem', marginTop: '0.4rem' }}>
          {clicks} clicks • 1 coin per 10
        </div>
      </div>

      {/* Main button */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <button
          ref={btnRef}
          onClick={handleClick}
          disabled={done}
          style={{
            position: 'relative',
            overflow: 'hidden',
            width: 180,
            height: 180,
            borderRadius: '50%',
            border: `3px solid ${done ? 'var(--gold-dim)' : 'var(--gold)'}`,
            background: done
              ? 'linear-gradient(135deg, var(--navy-l), var(--navy))'
              : 'linear-gradient(135deg, #1e1230, #2d1860)',
            cursor: done ? 'not-allowed' : 'pointer',
            fontSize: '4.5rem',
            boxShadow: done ? 'none' : '0 0 40px var(--gold-glow)',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
          }}
          onMouseDown={e => !done && (e.currentTarget.style.transform = 'scale(0.93)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          👑
          {ripples.map(r => (
            <span
              key={r.id}
              style={{
                position: 'absolute',
                left: r.x - 10,
                top: r.y - 10,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'rgba(201,168,76,0.4)',
                animation: 'rippleAnim 0.6s ease-out forwards',
                pointerEvents: 'none',
              }}
            />
          ))}
        </button>
      </div>

      {done && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ background: 'rgba(46,204,112,0.12)', border: '1px solid var(--green)', borderRadius: 'var(--r)', padding: '1rem', marginBottom: '1rem', color: 'var(--green)', fontFamily: 'var(--font-h)', fontSize: '0.9rem' }}>
            ✓ Session complete! You earned {sessionPts} Royal Coins!
          </div>
          <button className="btn btn-ghost" onClick={resetSession}>Play Again</button>
        </div>
      )}

      <style>{`
        @keyframes rippleAnim {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(8); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
