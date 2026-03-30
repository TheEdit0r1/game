import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import { PRIZES } from '../data/prizes'
import Confetti from '../components/Confetti'

// The secret message from Master — hardcoded, editable
const MASTER_MESSAGE = `You found it.

This place was built for you, June. Every game, every coin, every prize — it's all because you deserve to be treated like the queen you are.

You're the most extraordinary person I know, and I wanted to build you something that reflects that.

Your secret prize awaits.

I love you. 🖤`

const SECRET_PRIZE = PRIZES.find(p => p.isSecret)

export default function HiddenChamber() {
  const { addPoints, handleBlueClick } = useGame()
  const [revealed, setRevealed] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [claimed, setClaimed] = useState(() => localStorage.getItem('rg_secret_claimed') === 'true')

  useEffect(() => {
    // Fade in effect
    document.body.style.background = '#030308'
    return () => { document.body.style.background = '' }
  }, [])

  function reveal() {
    setRevealed(true)
    setConfetti(true)
  }

  function claim() {
    if (claimed) return
    addPoints(500, 'hidden_chamber_secret')
    localStorage.setItem('rg_secret_claimed', 'true')
    setClaimed(true)
    setConfetti(true)
  }

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {confetti && <Confetti active onDone={() => setConfetti(false)} />}

      <div style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
        {!revealed ? (
          <div style={{ animation: 'sbIn 0.8s ease' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1.5rem', animation: 'coinPulse 2s ease-in-out infinite' }}>🔮</div>
            <h1 style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', marginBottom: '1rem', textShadow: '0 0 50px var(--gold-glow)' }}>
              The Hidden Chamber
            </h1>
            <p style={{ color: 'var(--cream-d)', fontStyle: 'italic', marginBottom: '2.5rem', fontSize: '1rem' }}>
              You found what was hidden. Most never do.
            </p>
            <button className="btn btn-gold" style={{ fontSize: '1.1rem', padding: '0.8rem 2.5rem' }} onClick={reveal}>
              Enter the Chamber ✨
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✨</div>
            <h1 style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)', fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', marginBottom: '2rem', textShadow: '0 0 50px var(--gold-glow)' }}>
              A Message from Master
            </h1>

            <div className="card" style={{ textAlign: 'left', marginBottom: '2rem', padding: '2rem', borderColor: 'rgba(201,168,76,0.4)', background: 'linear-gradient(135deg, #15063a, #1a0d2a)' }}>
              <p style={{ whiteSpace: 'pre-line', lineHeight: 2, fontSize: '1rem', color: 'var(--cream)' }}>
                {MASTER_MESSAGE}
              </p>
            </div>

            {SECRET_PRIZE && (
              <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', borderColor: '#c77dff50', background: 'linear-gradient(135deg, rgba(155,89,182,0.15), var(--navy))' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{SECRET_PRIZE.emoji}</div>
                <div style={{ fontFamily: 'var(--font-h)', color: '#c77dff', marginBottom: '0.4rem', fontSize: '1rem' }}>🔮 Secret Prize Unlocked</div>
                <div style={{ color: 'var(--cream)', fontSize: '0.95rem', marginBottom: '1rem' }}>{SECRET_PRIZE.name}</div>
                <p style={{ color: 'var(--cream-d)', fontSize: '0.82rem', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                  This prize is yours, Your Highness. A gift from the Hidden Chamber.
                </p>
                <button
                  className="btn btn-gold"
                  onClick={claim}
                  disabled={claimed}
                  style={{ opacity: claimed ? 0.6 : 1 }}
                >
                  {claimed ? '✓ Secret Claimed' : 'Claim Secret Prize + 500 Coins 👑'}
                </button>
              </div>
            )}

            <p
              style={{ color: 'var(--cream-d)', fontSize: '0.8rem', fontStyle: 'italic', cursor: 'default' }}
              onClick={handleBlueClick}
            >
              You are loved more than you know. 🖤
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
