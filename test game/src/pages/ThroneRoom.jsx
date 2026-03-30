import { useState, useEffect, useCallback } from 'react'
import { useGame } from '../context/GameContext'
import { claimPrize, getPrizeClaims, getMasterPin, setMasterPin, updateClaimStatus } from '../lib/supabase'
import { PRIZES, TIER_META } from '../data/prizes'
import Confetti from '../components/Confetti'

const TIERS = ['tier1', 'tier2', 'tier3', 'tier4']

// Spin wheel prizes (all non-secret, non-wildcard)
const WHEEL_PRIZES = PRIZES.filter(p => !p.isSecret && p.type !== 'wildcard')

function WildcardWheel({ onClose, onSelect }) {
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [deg, setDeg] = useState(0)

  function spin() {
    if (spinning) return
    setSpinning(true)
    setResult(null)
    const idx = Math.floor(Math.random() * WHEEL_PRIZES.length)
    const extraSpins = 5 + Math.random() * 5
    const targetDeg = deg + extraSpins * 360 + (idx / WHEEL_PRIZES.length) * 360
    setDeg(targetDeg)
    setTimeout(() => {
      setSpinning(false)
      setResult(WHEEL_PRIZES[idx])
    }, 3500)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 800 }}>
      <div className="card" style={{ maxWidth: 480, width: '90vw', textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: 'var(--gold)', fontFamily: 'var(--font-h)', marginBottom: '1rem' }}>🎰 Wildcard Jackpot</h2>
        <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 1.5rem', borderRadius: '50%', border: '4px solid var(--gold)', overflow: 'hidden', background: 'var(--navy-l)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ transform: `rotate(${deg}deg)`, transition: spinning ? 'transform 3.5s cubic-bezier(0.17,0.67,0.12,1)' : 'none', fontSize: '3rem' }}>
            {result ? result.emoji : '🎰'}
          </div>
          {!result && <div style={{ position: 'absolute', fontSize: '0.7rem', color: 'var(--cream-d)', textAlign: 'center', padding: '2rem' }}>
            {spinning ? 'Spinning...' : 'Ready to spin'}
          </div>}
        </div>
        {result && (
          <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(201,168,76,0.1)', borderRadius: 'var(--r)', border: '1px solid var(--gold-dim)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{result.emoji}</div>
            <div className="prize-name">{result.name}</div>
            <div className="prize-cost">🪙 {result.cost} pts</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!result && <button className="btn btn-gold" onClick={spin} disabled={spinning}>
            {spinning ? 'Spinning...' : '🎰 Spin!'}
          </button>}
          {result && <button className="btn btn-gold" onClick={() => onSelect(result)}>Claim This Prize!</button>}
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

function TimerPicker({ prize, onClose, onConfirm }) {
  const [selected, setSelected] = useState(prize.durations?.[0])
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 800 }}>
      <div className="card" style={{ maxWidth: 400, width: '90vw', textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: 'var(--gold)', fontFamily: 'var(--font-h)', marginBottom: '0.5rem' }}>{prize.emoji} {prize.name.split('—')[0]}</h2>
        <p style={{ color: 'var(--cream-d)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Choose your duration:</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {prize.durations.map(d => (
            <button
              key={d}
              className={`btn ${selected === d ? 'btn-gold' : 'btn-ghost'}`}
              onClick={() => setSelected(d)}
            >{d}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn btn-gold" onClick={() => onConfirm(selected)}>Confirm 👑</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

function MasterAdminView({ claims, onUpdate, onClose }) {
  const [notes, setNotes] = useState({})

  async function handle(id, status) {
    await updateClaimStatus(id, status, notes[id] || null)
    onUpdate()
  }

  const pending = claims.filter(c => c.status === 'pending')
  const resolved = claims.filter(c => c.status !== 'pending')

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', overflowY: 'auto', zIndex: 900, padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'var(--gold)', fontFamily: 'var(--font-h)' }}>⚔️ Master's Admin View</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>

        {pending.length === 0 && <p style={{ color: 'var(--cream-d)', textAlign: 'center', padding: '2rem' }}>No pending claims.</p>}

        {pending.map(c => {
          const prize = c.prize || PRIZES.find(p => p.id === c.prize_id)
          return (
            <div key={c.id} className="dungeon-req" style={{ marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)', marginBottom: '0.3rem' }}>
                {prize?.emoji} {prize?.name}
              </div>
              <div style={{ color: 'var(--cream-d)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                🪙 {prize?.cost} pts • Claimed: {new Date(c.claimed_at).toLocaleDateString()}
              </div>
              <input
                className="inp"
                placeholder="Optional note for Her Highness..."
                value={notes[c.id] || ''}
                onChange={e => setNotes(n => ({ ...n, [c.id]: e.target.value }))}
                style={{ marginBottom: '0.5rem' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-gold btn-sm" onClick={() => handle(c.id, 'approved')}>✓ Approve</button>
                <button className="btn btn-danger btn-sm" onClick={() => handle(c.id, 'declined')}>✗ Decline</button>
              </div>
            </div>
          )
        })}

        {resolved.length > 0 && (
          <>
            <hr className="divider" />
            <h3 style={{ color: 'var(--cream-d)', fontFamily: 'var(--font-h)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Previous Claims</h3>
            {resolved.slice(0, 10).map(c => {
              const prize = c.prize || PRIZES.find(p => p.id === c.prize_id)
              return (
                <div key={c.id} style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem' }}>{prize?.emoji} {prize?.name?.slice(0, 50)}</span>
                  <span className={`s-${c.status}`} style={{ fontSize: '0.8rem', fontFamily: 'var(--font-h)' }}>
                    {c.status === 'approved' ? '✓ Approved' : '✗ Declined'}
                  </span>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

export default function ThroneRoom() {
  const { totalPoints, deductPoints, handleBlueClick } = useGame()
  const [claims, setClaims] = useState([])
  const [showAdmin, setShowAdmin] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinScreen, setPinScreen] = useState(false)
  const [pinError, setPinError] = useState('')
  const [confetti, setConfetti] = useState(false)
  const [wildcard, setWildcard] = useState(null)
  const [timerPicker, setTimerPicker] = useState(null)
  const [claimMsg, setClaimMsg] = useState('')

  useEffect(() => { loadClaims() }, [])

  async function loadClaims() {
    const data = await getPrizeClaims()
    setClaims(data)
  }

  async function handleClaim(prize, durNote = '') {
    if (totalPoints < prize.cost && !prize.isSecret) {
      setClaimMsg("Not enough Royal Coins, Your Highness! Keep playing 🎮")
      setTimeout(() => setClaimMsg(''), 3000)
      return
    }

    const ok = prize.isSecret ? true : await deductPoints(prize.cost)
    if (!ok) return

    const claimData = { ...prize, name: durNote ? `${prize.name} (${durNote})` : prize.name }
    await claimPrize(null, claimData)
    await loadClaims()
    setConfetti(true)
    setClaimMsg("Claimed! Pending Master's approval 👑")
    setTimeout(() => setClaimMsg(''), 4000)
  }

  async function handleMasterPin() {
    const stored = await getMasterPin()
    if (!stored) {
      await setMasterPin(null, pinInput)
      setShowAdmin(true)
      setPinScreen(false)
      setPinInput('')
    } else if (pinInput === stored) {
      setShowAdmin(true)
      setPinScreen(false)
      setPinInput('')
    } else {
      setPinError('Wrong PIN, good boy. Try again.')
    }
  }

  function surpriseMe() {
    const affordable = PRIZES.filter(p => !p.isSecret && p.cost <= totalPoints)
    if (!affordable.length) {
      setClaimMsg("Not enough coins for any prize yet! Keep playing 🎮")
      setTimeout(() => setClaimMsg(''), 3000)
      return
    }
    const pick = affordable[Math.floor(Math.random() * affordable.length)]
    if (pick.type === 'timer') { setTimerPicker(pick); return }
    if (pick.type === 'wildcard') { setWildcard(true); return }
    handleClaim(pick)
  }

  const pendingCount = claims.filter(c => c.status === 'pending').length

  // Wrap text clicks for blue mode secret
  function BlueText({ children }) {
    return <span onClick={handleBlueClick} style={{ cursor: 'default' }}>{children}</span>
  }

  return (
    <div>
      {confetti && <Confetti active onDone={() => setConfetti(false)} />}
      {wildcard && <WildcardWheel onClose={() => setWildcard(false)} onSelect={(p) => { setWildcard(false); handleClaim(p) }} />}
      {timerPicker && <TimerPicker prize={timerPicker} onClose={() => setTimerPicker(null)} onConfirm={(dur) => { handleClaim(timerPicker, dur); setTimerPicker(null) }} />}
      {pinScreen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 800 }}>
          <div className="card" style={{ maxWidth: 320, width: '90vw', textAlign: 'center', padding: '2rem' }}>
            <h2 style={{ color: 'var(--gold)', fontFamily: 'var(--font-h)', marginBottom: '1rem' }}>⚔️ Master's PIN</h2>
            <input
              type="password"
              className="inp pin-input"
              maxLength={4}
              value={pinInput}
              onChange={e => { setPinInput(e.target.value); setPinError('') }}
              onKeyDown={e => e.key === 'Enter' && handleMasterPin()}
              placeholder="••••"
              style={{ textAlign: 'center', fontSize: '1.8rem', letterSpacing: '0.5rem', marginBottom: '0.5rem' }}
            />
            {pinError && <p style={{ color: 'var(--red)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{pinError}</p>}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
              <button className="btn btn-gold" onClick={handleMasterPin}>Enter</button>
              <button className="btn btn-ghost" onClick={() => { setPinScreen(false); setPinInput(''); setPinError('') }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showAdmin && <MasterAdminView claims={claims} onUpdate={loadClaims} onClose={() => setShowAdmin(false)} />}

      <div className="ph">
        <h1 className="ph-title">👑 The Throne Room</h1>
        <p className="ph-sub">Redeem your Royal Coins for prizes, Your Highness</p>
      </div>

      {/* Top bar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)', fontSize: '1.1rem' }}>
          🪙 Balance: {totalPoints.toLocaleString()}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-gold" onClick={surpriseMe}>Surprise Me 🎲</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setPinScreen(true)} style={{ position: 'relative' }}>
            ⚔️ Master View
            {pendingCount > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--red)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-h)' }}>{pendingCount}</span>}
          </button>
        </div>
      </div>

      {claimMsg && (
        <div style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid var(--gold-dim)', borderRadius: 'var(--r)', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontFamily: 'var(--font-h)', color: 'var(--gold)', textAlign: 'center', fontSize: '0.9rem' }}>
          {claimMsg}
        </div>
      )}

      {/* Pending claims reminder */}
      {pendingCount > 0 && (
        <div style={{ background: 'rgba(26,107,204,0.12)', border: '1px solid var(--blue)', borderRadius: 'var(--r)', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: 'var(--blue-l)' }}>
          ⏳ You have {pendingCount} claim{pendingCount > 1 ? 's' : ''} awaiting Master's approval.
        </div>
      )}

      {/* Prize tiers */}
      {TIERS.map(tier => {
        const meta = TIER_META[tier]
        const tierPrizes = PRIZES.filter(p => p.tier === tier && !p.isSecret)
        return (
          <div key={tier} style={{ marginBottom: '3rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', color: meta.color, fontSize: '1.2rem', marginBottom: '0.2rem' }}>{meta.label}</h2>
              <p style={{ color: 'var(--cream-d)', fontSize: '0.82rem', fontStyle: 'italic' }}>{meta.desc} — <span className={`tb tb-${tier.replace('tier','')}`}>{meta.range}</span></p>
            </div>
            <div className="prize-grid">
              {tierPrizes.map(prize => {
                const canAfford = totalPoints >= prize.cost
                const isIOU = prize.type === 'iou'
                const isWildcard = prize.type === 'wildcard'
                const isTimer = prize.type === 'timer'
                return (
                  <div key={prize.id} className={`prize-card${isIOU ? ' iou' : ''}${!canAfford ? ' locked' : ''}`}>
                    {isIOU && <div style={{ fontSize: '0.68rem', color: 'var(--blue-l)', marginBottom: '0.3rem' }}>🌸 Visit IOU</div>}
                    {isTimer && <div style={{ fontSize: '0.68rem', color: 'var(--cream-d)', marginBottom: '0.3rem' }}>⏱️ Duration selectable</div>}
                    {isWildcard && <div style={{ fontSize: '0.68rem', color: '#c77dff', marginBottom: '0.3rem' }}>🎰 Spin wheel</div>}
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{prize.emoji}</div>
                    <div className="prize-cost">🪙 {prize.cost.toLocaleString()}</div>
                    <div className="prize-name">{prize.name}</div>
                    <button
                      className="btn btn-gold btn-sm"
                      style={{ width: '100%', marginTop: '0.6rem' }}
                      disabled={!canAfford}
                      onClick={() => {
                        if (isWildcard) { setWildcard(true); return }
                        if (isTimer) { setTimerPicker(prize); return }
                        handleClaim(prize)
                      }}
                    >
                      {canAfford ? 'Claim 👑' : `Need ${prize.cost - totalPoints} more`}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Hidden: blue dot secret hint */}
      <p style={{ textAlign: 'center', color: 'var(--cream-d)', fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.6, marginTop: '1rem' }}>
        All prizes are subject to Master's approval. Your patience is noted<span
          title="seek what is hidden"
          onClick={handleBlueClick}
          style={{ cursor: 'default', color: 'transparent', userSelect: 'none' }}
        >·</span>
      </p>
    </div>
  )
}
