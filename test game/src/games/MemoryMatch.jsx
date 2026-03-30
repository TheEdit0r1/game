import { useState, useEffect, useRef, useCallback } from 'react'
import { useGame } from '../context/GameContext'
import Confetti from '../components/Confetti'

const CARD_SETS = {
  '4x4': { pairs: 8, time: 60, bonus: 30, pts: 50, label: '4×4' },
  '6x6': { pairs: 18, time: 120, bonus: 50, pts: 120, label: '6×6' },
  '8x8': { pairs: 32, time: 240, bonus: 80, pts: 200, label: '8×8' },
}

const CARD_EMOJIS = ['👑', '💎', '🌹', '🦋', '🌙', '⭐', '🔮', '💜', '🌸', '🏆', '🦄', '🍷', '💫', '🎭', '🌺', '🕊️', '💌', '🌟', '🧿', '🎀', '🦚', '🪄', '🌙', '💛', '🌊', '🐚', '🌈', '🧁', '🍓', '🌻', '💍', '👸']

function makeGrid(pairs) {
  const emojis = CARD_EMOJIS.slice(0, pairs)
  const doubled = [...emojis, ...emojis]
  // shuffle
  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]]
  }
  return doubled.map((emoji, i) => ({ id: i, emoji, matched: false }))
}

export default function MemoryMatch() {
  const { addPoints } = useGame()
  const [mode, setMode] = useState(null) // '4x4' | '6x6' | '8x8'
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState(0)
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [earned, setEarned] = useState(0)
  const [confetti, setConfetti] = useState(false)
  const [locked, setLocked] = useState(false)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  function startGame(m) {
    const cfg = CARD_SETS[m]
    setMode(m)
    setCards(makeGrid(cfg.pairs))
    setFlipped([])
    setMatched(0)
    setTime(0)
    setDone(false)
    setEarned(0)
    setRunning(true)
    startTimeRef.current = Date.now()
  }

  useEffect(() => {
    if (!running || done) { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => setTime(Math.floor((Date.now() - startTimeRef.current) / 1000)), 200)
    return () => clearInterval(timerRef.current)
  }, [running, done])

  const handleCard = useCallback((idx) => {
    if (locked || done || cards[idx].matched || flipped.includes(idx)) return
    if (flipped.length === 2) return

    const newFlipped = [...flipped, idx]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setLocked(true)
      const [a, b] = newFlipped
      if (cards[a].emoji === cards[b].emoji) {
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => newFlipped.includes(i) ? { ...c, matched: true } : c))
          const newMatched = matched + 1
          setMatched(newMatched)
          setFlipped([])
          setLocked(false)

          const cfg = CARD_SETS[mode]
          if (newMatched === cfg.pairs) {
            finishGame(cfg)
          }
        }, 400)
      } else {
        // No match
        setTimeout(() => {
          setFlipped([])
          setLocked(false)
        }, 800)
      }
    }
  }, [locked, done, cards, flipped, matched, mode])

  function finishGame(cfg) {
    setRunning(false)
    setDone(true)

    let total = cfg.pts
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
    let bonus = 0
    if (elapsed <= cfg.time) {
      bonus = cfg.bonus
      total += bonus
    }
    setEarned(total)
    addPoints(total, `memory_${mode}`)
    setConfetti(true)
  }

  if (!mode) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="ph">
          <h1 className="ph-title">🃏 Memory Match</h1>
          <p className="ph-sub">Flip cards and find all the pairs, Your Highness</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          {Object.entries(CARD_SETS).map(([key, cfg]) => (
            <button
              key={key}
              className="game-card"
              style={{ border: '1px solid rgba(201,168,76,0.25)', cursor: 'pointer' }}
              onClick={() => startGame(key)}
            >
              <span className="game-card-icon">🃏</span>
              <div className="game-card-title">{cfg.label} Grid</div>
              <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-h)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                🪙 {cfg.pts} pts
              </div>
              <div style={{ color: 'var(--cream-d)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                +{cfg.bonus} time bonus
              </div>
              <div style={{ color: 'var(--cream-d)', fontSize: '0.72rem' }}>Beat {cfg.time}s</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const cfg = CARD_SETS[mode]
  const cols = mode === '4x4' ? 4 : mode === '6x6' ? 6 : 8
  const cardSize = mode === '8x8' ? 56 : mode === '6x6' ? 72 : 90

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {confetti && <Confetti active onDone={() => setConfetti(false)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)' }}>🃏 {cfg.label} Grid</h2>
          <div style={{ color: 'var(--cream-d)', fontSize: '0.82rem' }}>Pairs: {matched}/{cfg.pairs}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-h)', color: time > cfg.time ? 'var(--red)' : 'var(--gold)', fontSize: '1.3rem' }}>
            ⏱ {time}s
          </div>
          <div style={{ color: 'var(--cream-d)', fontSize: '0.75rem' }}>
            Beat {cfg.time}s for +{cfg.bonus} bonus
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setMode(null)}>Back</button>
      </div>

      {done ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✨</div>
          <h2 style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)', marginBottom: '0.5rem' }}>Complete!</h2>
          <div style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)', fontSize: '2rem', marginBottom: '0.5rem' }}>
            +{earned} 🪙
          </div>
          {time <= cfg.time && (
            <div style={{ color: 'var(--green)', fontSize: '0.88rem', marginBottom: '1rem' }}>
              ✓ Time bonus included! ({time}s / {cfg.time}s)
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-gold" onClick={() => startGame(mode)}>Play Again</button>
            <button className="btn btn-ghost" onClick={() => setMode(null)}>Change Grid</button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: mode === '8x8' ? '4px' : '6px',
          maxWidth: '100%',
          margin: '0 auto',
        }}>
          {cards.map((card, idx) => {
            const isFlipped = flipped.includes(idx) || card.matched
            return (
              <div
                key={card.id}
                onClick={() => handleCard(idx)}
                style={{
                  height: cardSize,
                  borderRadius: 6,
                  cursor: card.matched ? 'default' : 'pointer',
                  perspective: 600,
                  userSelect: 'none',
                }}
              >
                <div style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.35s ease',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}>
                  {/* Back */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backfaceVisibility: 'hidden',
                    background: card.matched ? 'transparent' : 'linear-gradient(135deg, #1a1240, #2d1860)',
                    border: `1px solid ${card.matched ? 'transparent' : 'rgba(201,168,76,0.3)'}`,
                    borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: cardSize * 0.35,
                  }}>
                    {!card.matched && '👑'}
                  </div>
                  {/* Front */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: card.matched ? 'rgba(46,204,112,0.12)' : 'linear-gradient(135deg, var(--navy-l), var(--navy))',
                    border: `1px solid ${card.matched ? 'var(--green)' : 'rgba(201,168,76,0.5)'}`,
                    borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: cardSize * 0.45,
                  }}>
                    {card.emoji}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
