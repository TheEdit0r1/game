import { Link } from 'react-router-dom'
import { useGame } from '../context/GameContext'

const quickLinks = [
  { to: '/games', icon: '🎮', label: 'Play Games', desc: 'Earn Royal Coins' },
  { to: '/throne-room', icon: '👑', label: 'Throne Room', desc: 'Spend your coins' },
  { to: '/dungeon', icon: '🔒', label: 'Royal Dungeon', desc: 'Submit requests' },
]

const tiers = [
  { icon: '🟢', label: 'Royal Treat', range: '100–300', color: '#3dd68c' },
  { icon: '🟡', label: "Queen's Favour", range: '400–700', color: '#ffd700' },
  { icon: '🔴', label: 'Grand Reward', range: '800–1500', color: '#ff6b7a' },
  { icon: '👑', label: 'Legendary', range: '2000+', color: '#c77dff' },
]

export default function RoyalCourt() {
  const { totalPoints, handleCrownClick } = useGame()

  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div
          style={{ fontSize: '5rem', cursor: 'pointer', userSelect: 'none', display: 'inline-block', transition: 'transform 0.1s' }}
          onClick={handleCrownClick}
          title="✦" // faint 7 hint
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          👑
        </div>
        <h1 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', color: 'var(--gold)', textShadow: '0 0 40px var(--gold-glow)', marginBottom: '0.3rem' }}>
          The Royal Court
        </h1>
        <p style={{ color: 'var(--cream-d)', fontStyle: 'italic' }}>
          Welcome, Your Highness. Your kingdom awaits.
        </p>
      </div>

      {/* Points display */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '2rem', padding: '2.5rem' }}>
        <div className="coin-label" style={{ marginBottom: '0.5rem' }}>Royal Coins Balance</div>
        <div className="coin-big">🪙 {totalPoints.toLocaleString()}</div>
        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/throne-room" className="btn btn-gold">Spend Coins 👑</Link>
          <Link to="/games" className="btn btn-ghost">Earn More 🎮</Link>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {quickLinks.map(l => (
          <Link key={l.to} to={l.to} className="game-card">
            <span className="game-card-icon">{l.icon}</span>
            <div className="game-card-title">{l.label}</div>
            <div className="game-card-desc">{l.desc}</div>
          </Link>
        ))}
      </div>

      {/* Tier reference */}
      <div className="card">
        <h2 className="section-title">💎 Prize Tiers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {tiers.map(t => (
            <div key={t.label} style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r)', border: `1px solid ${t.color}30` }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>{t.icon}</div>
              <div style={{ fontFamily: 'var(--font-h)', color: t.color, fontSize: '0.8rem', marginBottom: '0.15rem' }}>{t.label}</div>
              <div style={{ color: 'var(--cream-d)', fontSize: '0.75rem' }}>{t.range} pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
