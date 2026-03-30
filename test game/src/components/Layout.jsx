import { Outlet } from 'react-router-dom'
import Nav from './Nav'
import Toasts from './Toasts'
import { useGame } from '../context/GameContext'

export default function Layout() {
  const { loading } = useGame()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)', fontSize: '1.5rem', letterSpacing: '0.2em' }}>
          ♛ Loading the Royal Court...
        </div>
      </div>
    )
  }

  return (
    <div className="app-wrap">
      <Nav />
      <main className="page">
        <Outlet />
      </main>
      <Toasts />
    </div>
  )
}
