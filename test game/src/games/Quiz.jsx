import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import { getQuizQuestions } from '../lib/supabase'
import Confetti from '../components/Confetti'

const PTS_PER_Q = 15
const STREAK_BONUS = 25
const RISK_ALL_PTS = 300
const STREAK_AT = 5

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Quiz() {
  const { addPoints } = useGame()
  const [questions, setQuestions] = useState([])
  const [queue, setQueue] = useState([])
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [sessionPts, setSessionPts] = useState(0)
  const [streak, setStreak] = useState(0)
  const [risked, setRisked] = useState(false)
  const [riskPrompt, setRiskPrompt] = useState(false)
  const [done, setDone] = useState(false)
  const [doneReason, setDoneReason] = useState('')
  const [totalEarned, setTotalEarned] = useState(0)
  const [confetti, setConfetti] = useState(false)
  const [allCorrectAnim, setAllCorrectAnim] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => { getQuizQuestions().then(setQuestions) }, [])

  function startQuiz() {
    const q = shuffle(questions).slice(0, 10)
    setQueue(q)
    setQIdx(0)
    setSelected(null)
    setConfirmed(false)
    setSessionPts(0)
    setStreak(0)
    setRisked(false)
    setRiskPrompt(false)
    setDone(false)
    setDoneReason('')
    setTotalEarned(0)
    setStarted(true)
  }

  const current = queue[qIdx]

  function handleAnswer(idx) {
    if (confirmed) return
    setSelected(idx)
    setConfirmed(true)

    const isAllCorrect = current.correct_index === -1
    const isCorrect = isAllCorrect || idx === current.correct_index

    if (isAllCorrect) setAllCorrectAnim(true)

    if (isCorrect) {
      const newStreak = streak + 1
      setStreak(newStreak)
      let pts = PTS_PER_Q
      if (newStreak % STREAK_AT === 0) pts += STREAK_BONUS
      setSessionPts(p => p + pts)
    } else {
      setStreak(0)
    }
  }

  function nextQuestion() {
    setAllCorrectAnim(false)
    const nextIdx = qIdx + 1

    // After Q5, show risk prompt (if not already risked)
    if (nextIdx === STREAK_AT && !risked) {
      setRiskPrompt(true)
      setQIdx(nextIdx)
      setSelected(null)
      setConfirmed(false)
      return
    }

    if (nextIdx >= queue.length) {
      // Finished all 10
      finishQuiz(risked ? 'risk_complete' : 'normal')
      return
    }

    setQIdx(nextIdx)
    setSelected(null)
    setConfirmed(false)
  }

  function handleKeep() {
    // Bank points and end
    addPoints(sessionPts, 'quiz')
    setTotalEarned(sessionPts)
    setDone(true)
    setDoneReason('banked')
  }

  function handleRisk() {
    setRisked(true)
    setRiskPrompt(false)
  }

  function finishQuiz(reason) {
    let earned = 0
    if (reason === 'risk_complete') {
      earned = RISK_ALL_PTS
    } else if (reason === 'normal') {
      earned = sessionPts
    }
    // If risked but quit mid-way (shouldn't happen here), lose session pts
    addPoints(earned, 'quiz')
    setTotalEarned(earned)
    setDone(true)
    setDoneReason(reason)
    if (earned > 0) setConfetti(true)
  }

  if (!started || questions.length === 0) {
    return (
      <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
        <div className="ph">
          <h1 className="ph-title">❓ Royal Quiz</h1>
          <p className="ph-sub">Answer questions about the Queen. Risk it all for 300 pts.</p>
        </div>
        <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <h3 style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)', marginBottom: '0.75rem' }}>How it works</h3>
          <ul style={{ color: 'var(--cream-d)', fontSize: '0.88rem', paddingLeft: '1.25rem', lineHeight: 2 }}>
            <li>15 pts per correct answer</li>
            <li>+25 bonus every 5-question streak</li>
            <li>After Q5: <strong style={{ color: 'var(--gold)' }}>Keep your coins</strong> or <strong style={{ color: 'var(--red)' }}>Risk it all</strong></li>
            <li>Finish all 10 after risking → <strong style={{ color: 'var(--gold)' }}>300 pts flat</strong></li>
            <li>Quit after risking → <strong style={{ color: 'var(--red)' }}>lose all session coins</strong></li>
          </ul>
        </div>
        <button className="btn btn-gold" style={{ fontSize: '1.1rem', padding: '0.75rem 2.5rem' }} onClick={startQuiz} disabled={!questions.length}>
          Begin the Quiz 👑
        </button>
      </div>
    )
  }

  if (done) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        {confetti && <Confetti active onDone={() => setConfetti(false)} />}
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{totalEarned > 0 ? '✨' : '😔'}</div>
        <h2 style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)', fontSize: '2rem', marginBottom: '0.5rem' }}>
          {doneReason === 'risk_complete' ? 'Daring Victory!' : doneReason === 'banked' ? 'Coins Banked!' : 'Quiz Done!'}
        </h2>
        <div style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)', fontSize: '2.5rem', margin: '1rem 0' }}>
          +{totalEarned} 🪙
        </div>
        {doneReason === 'risk_complete' && (
          <p style={{ color: 'var(--cream-d)', fontStyle: 'italic', marginBottom: '1rem' }}>
            You risked it all and answered every question. The Queen is formidable. 👑
          </p>
        )}
        <button className="btn btn-gold" onClick={startQuiz}>Play Again</button>
      </div>
    )
  }

  if (riskPrompt) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ animation: 'sbIn 0.4s ease' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚖️</div>
          <h2 style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            Keep Your Coins or Risk It All?
          </h2>
          <div style={{ fontFamily: 'var(--font-h)', color: 'var(--cream)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            Current: 🪙 {sessionPts} pts
          </div>
          <p style={{ color: 'var(--cream-d)', marginBottom: '2rem', fontSize: '0.88rem' }}>
            Risk it — answer all 10 questions and win <strong style={{ color: 'var(--gold)' }}>300 pts flat</strong>.<br />
            Quit after risking and you <strong style={{ color: 'var(--red)' }}>lose everything</strong>.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-gold" style={{ fontSize: '1rem' }} onClick={handleKeep}>
              🏦 Keep {sessionPts} Coins
            </button>
            <button className="btn btn-danger" style={{ fontSize: '1rem' }} onClick={handleRisk}>
              🎲 Risk It All!
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!current) return null

  const isAllCorrect = current.correct_index === -1
  const progress = ((qIdx) / queue.length) * 100

  function answerStyle(idx) {
    if (!confirmed) return {}
    const isThisCorrect = isAllCorrect || idx === current.correct_index
    const isSelected = idx === selected
    if (isThisCorrect) return { background: 'rgba(46,204,112,0.25)', borderColor: 'var(--green)', color: 'white' }
    if (isSelected && !isThisCorrect) return { background: 'rgba(204,51,51,0.25)', borderColor: 'var(--red)', color: 'white' }
    return { opacity: 0.5 }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      {allCorrectAnim && (
        <div style={{ textAlign: 'center', animation: 'sbIn 0.3s ease', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)', fontSize: '0.9rem' }}>
            ✨ The Queen is always right!
          </span>
        </div>
      )}

      {/* Progress */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontFamily: 'var(--font-h)', color: 'var(--cream-d)', fontSize: '0.8rem' }}>Question {qIdx + 1} / {queue.length}</span>
          <span style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)', fontSize: '0.8rem' }}>🪙 {sessionPts}</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--gold)', width: `${progress}%`, transition: 'width 0.3s' }} />
        </div>
        {risked && <div style={{ color: 'var(--red)', fontSize: '0.72rem', marginTop: '0.3rem', fontFamily: 'var(--font-h)' }}>⚡ RISKED — finish all 10 for 300 pts</div>}
        {streak >= 2 && <div style={{ color: 'var(--green)', fontSize: '0.72rem', marginTop: '0.2rem' }}>🔥 {streak} streak!</div>}
      </div>

      <div className="card" style={{ marginBottom: '1.25rem', padding: '1.75rem' }}>
        <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', color: 'var(--cream)', lineHeight: 1.5 }}>
          {current.question}
        </h2>
      </div>

      <div style={{ display: 'grid', gap: '0.65rem', gridTemplateColumns: '1fr 1fr' }}>
        {current.answers.map((ans, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={confirmed}
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--r)',
              border: '1px solid rgba(201,168,76,0.3)',
              background: 'linear-gradient(135deg, var(--navy-l), var(--navy))',
              color: 'var(--cream)',
              fontSize: '0.88rem',
              cursor: confirmed ? 'default' : 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
              fontFamily: 'var(--font-b)',
              ...answerStyle(i),
            }}
            onMouseEnter={e => !confirmed && (e.currentTarget.style.borderColor = 'var(--gold)')}
            onMouseLeave={e => !confirmed && (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)')}
          >
            <span style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)', marginRight: '0.4rem' }}>
              {['A', 'B', 'C', 'D'][i]}.
            </span>
            {ans}
          </button>
        ))}
      </div>

      {confirmed && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          {isAllCorrect && (
            <div style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              ✨ The Queen is always right! All answers accepted!
            </div>
          )}
          <button className="btn btn-gold" onClick={nextQuestion}>
            {qIdx + 1 >= queue.length ? 'Finish Quiz 👑' : 'Next Question →'}
          </button>
        </div>
      )}
    </div>
  )
}
