import { useEffect, useRef } from 'react'

const COLORS = ['#c9a84c', '#e8c96a', '#1a6bcc', '#9b59b6', '#f0e6d3', '#ff6eb8']

export default function Confetti({ active, onDone }) {
  const particles = useRef([])

  if (!active) return null

  const items = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    duration: 1.5 + Math.random() * 2,
    delay: Math.random() * 0.8,
    size: 6 + Math.random() * 8,
  }))

  return (
    <div className="confetti-wrap" onAnimationEnd={onDone}>
      {items.map(p => (
        <div
          key={p.id}
          className="cp"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
