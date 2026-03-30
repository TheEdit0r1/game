import { useGame } from '../context/GameContext'

export default function Toasts() {
  const { toasts, secretToast } = useGame()

  return (
    <>
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>

      {secretToast && (
        <div className="secret-overlay">
          <div className="secret-box">
            <h2>{secretToast}</h2>
          </div>
        </div>
      )}
    </>
  )
}
