import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useGame } from '../context/GameContext'

const SINGLE_GAMES = [
  { to: '/games/clicker', icon: '👆', title: "The Royal Clicker", desc: 'Click the throne. Earn coins. Simple. Satisfying.', pts: 'Up to 50 pts' },
  { to: '/games/memory', icon: '🃏', title: 'Memory Match', desc: 'Flip cards and find all the pairs. Beat the timer for bonus.', pts: 'Up to 200+ pts' },
  { to: '/games/quiz', icon: '❓', title: 'Royal Quiz', desc: 'Answer questions about the Queen. Risk it all for 300 pts.', pts: '15–300 pts' },
  { to: '/games/runner', icon: '🏃', title: 'Endless Runner', desc: 'Run as far as you can. Collect gems and crowns.', pts: 'Unlimited' },
]

const MULTI_GAMES = [
  { to: '/games/hangman', icon: '🎭', title: 'Hangman', desc: 'Guess the word or set a word for June to guess.', pts: '40–60 pts' },
  { to: '/games/tictactoe', icon: '⬛', title: 'Tic Tac Toe', desc: 'Queen vs Master. She has a royal veto.', pts: '30–100 pts' },
  { to: '/games/dice', icon: '🎲', title: 'Dice Roll', desc: 'Roll the dice. Land a 6 for 75 pts. Land a 5 for a task!', pts: '10–75 pts' },
]

export default function Games() {
  const { handleBlueClick } = useGame()

  // Paw wobble hint for loyal dog easter egg
  useEffect(() => {
    const paws = document.querySelectorAll('.paw-hint')
    paws.forEach(p => {
      p.style.display = 'inline-block'
      p.style.transition = 'transform 0.3s ease'
    })
  }, [])

  return (
    <div>
      <div className="ph">
        <h1 className="ph-title">🎮 The Queen's Games</h1>
        <p className="ph-sub">Choose your game, earn your coins, Your Highness</p>
      </div>

      <h2 className="section-title">👑 The Queen's Games</h2>
      <p style={{ color: 'var(--cream-d)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
        Solo games — play at your own pace and earn Royal Coins
      </p>
      <div className="games-grid" style={{ marginBottom: '2.5rem' }}>
        {SINGLE_GAMES.map(g => (
          <Link key={g.to} to={g.to} className="game-card">
            <span className="game-card-icon">{g.icon}</span>
            <div className="game-card-title">{g.title}</div>
            <div className="game-card-desc">{g.desc}</div>
            <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: 'var(--gold)', fontFamily: 'var(--font-h)' }}>{g.pts}</div>
          </Link>
        ))}
      </div>

      <hr className="divider" />

      <h2 className="section-title">⚔️ Royal Challenges</h2>
      <p style={{ color: 'var(--cream-d)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
        Multiplayer — same device or over TeamViewer
      </p>
      <div className="games-grid">
        {MULTI_GAMES.map(g => (
          <Link key={g.to} to={g.to} className="game-card" style={{ position: 'relative' }}>
            <span className="game-card-icon">
              {g.icon}
              {g.to === '/games/tictactoe' && (
                <span
                  className="paw-hint"
                  onMouseEnter={e => e.currentTarget.style.transform = 'rotate(-15deg) scale(1.2)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1)'}
                  style={{ fontSize: '1rem', marginLeft: '0.3rem', cursor: 'default' }}
                >🐾</span>
              )}
            </span>
            <div className="game-card-title">{g.title}</div>
            <div className="game-card-desc">{g.desc}</div>
            <span className="mp-badge">2 Players</span>
            <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: 'var(--gold)', fontFamily: 'var(--font-h)' }}>{g.pts}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
