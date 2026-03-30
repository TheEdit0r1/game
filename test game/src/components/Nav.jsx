import { NavLink } from 'react-router-dom'
import { useGame } from '../context/GameContext'

const links = [
  { to: '/', label: 'Royal Court' },
  { to: '/throne-room', label: 'Throne Room' },
  { to: '/games', label: 'Games' },
  { to: '/dungeon', label: 'Dungeon' },
]

export default function Nav() {
  const { totalPoints, masterMode } = useGame()

  return (
    <>
      {masterMode && (
        <div className="master-banner">⚔️ MASTER MODE ACTIVE — 50% BONUS POINTS ⚔️</div>
      )}
      <nav className="nav">
        <div className="nav-inner">
          <span className="nav-brand">♛ Queen June</span>
          <div className="nav-links">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
              >
                {l.label}
              </NavLink>
            ))}
          </div>
          <div className="nav-coins">🪙 {totalPoints.toLocaleString()}</div>
        </div>
      </nav>
    </>
  )
}
