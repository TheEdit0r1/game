import { useState, useEffect } from 'react'
import { getDungeonRequests, addDungeonRequest, updateDungeonRequest, getMasterPin, setMasterPin } from '../lib/supabase'

const CATEGORIES = [
  { value: 'royal-command', label: '👑 Royal Command', desc: 'Something you want done' },
  { value: 'pampering', label: '💆 Pampering Request', desc: 'Treat yourself' },
  { value: 'adventure', label: '🗺️ Adventure', desc: 'Trip or day out' },
  { value: 'wish', label: '🌟 Just a Wish', desc: 'Something you desire' },
  { value: 'secret', label: '🔒 Secret Request', desc: 'Only Master sees' },
]

function CategoryLabel({ cat }) {
  const c = CATEGORIES.find(x => x.value === cat)
  return <span style={{ fontSize: '0.8rem' }}>{c ? c.label : cat}</span>
}

export default function Dungeon() {
  const [requests, setRequests] = useState([])
  const [text, setText] = useState('')
  const [category, setCategory] = useState('royal-command')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Master admin
  const [masterMode, setMasterMode] = useState(false)
  const [pinScreen, setPinScreen] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [notes, setNotes] = useState({})

  useEffect(() => { load() }, [])

  async function load() {
    const data = await getDungeonRequests()
    setRequests(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    await addDungeonRequest(text.trim(), category)
    setText('')
    setCategory('royal-command')
    await load()
    setSubmitting(false)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  async function handleMasterPin() {
    const stored = await getMasterPin()
    if (!stored) {
      await setMasterPin(null, pinInput)
      setMasterMode(true)
      setPinScreen(false)
      setPinInput('')
    } else if (pinInput === stored) {
      setMasterMode(true)
      setPinScreen(false)
      setPinInput('')
    } else {
      setPinError('Wrong PIN.')
    }
  }

  async function handleUpdate(id, status) {
    await updateDungeonRequest(id, status, notes[id] || null)
    await load()
  }

  // June sees non-secret requests; Master sees all
  const visible = masterMode ? requests : requests.filter(r => r.status !== 'pending' || r.category !== 'secret')
  const pending = requests.filter(r => r.status === 'pending')
  const pendingCount = pending.length

  return (
    <div>
      <div className="ph">
        <h1 className="ph-title">🔒 The Royal Dungeon</h1>
        <p className="ph-sub">Submit your wishes and commands, Your Highness</p>
      </div>

      {/* Submit form */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">✨ New Request</h2>
        {submitted && (
          <div style={{ background: 'rgba(46,204,112,0.12)', border: '1px solid var(--green)', borderRadius: 'var(--r)', padding: '0.65rem 1rem', marginBottom: '1rem', color: 'var(--green)', fontSize: '0.88rem', fontFamily: 'var(--font-h)' }}>
            ✓ Your request has been submitted, Your Highness.
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--cream-d)', fontSize: '0.85rem', marginBottom: '0.4rem', fontFamily: 'var(--font-h)' }}>Category</label>
            <select className="sel" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label} — {c.desc}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--cream-d)', fontSize: '0.85rem', marginBottom: '0.4rem', fontFamily: 'var(--font-h)' }}>Your Request</label>
            <textarea
              className="inp"
              rows={3}
              placeholder="What does the Queen desire?"
              value={text}
              onChange={e => setText(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
          <button className="btn btn-gold" type="submit" disabled={submitting || !text.trim()}>
            {submitting ? 'Submitting...' : 'Submit to the Dungeon 🔒'}
          </button>
        </form>
      </div>

      {/* Master view toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>📜 Requests</h2>
        {masterMode ? (
          <button className="btn btn-ghost btn-sm" onClick={() => setMasterMode(false)}>Exit Master View</button>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={() => setPinScreen(true)} style={{ position: 'relative' }}>
            ⚔️ Master View
            {pendingCount > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--red)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pendingCount}</span>}
          </button>
        )}
      </div>

      {/* PIN screen */}
      {pinScreen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 800 }}>
          <div className="card" style={{ maxWidth: 320, width: '90vw', textAlign: 'center', padding: '2rem' }}>
            <h2 style={{ color: 'var(--gold)', fontFamily: 'var(--font-h)', marginBottom: '1rem' }}>⚔️ Master's PIN</h2>
            <input
              type="password"
              className="inp"
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

      {/* Request list */}
      {visible.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--cream-d)', padding: '3rem', fontStyle: 'italic' }}>
          The dungeon awaits your first wish, Your Highness...
        </div>
      )}

      {['pending', 'approved', 'declined'].map(statusFilter => {
        const group = visible.filter(r => r.status === statusFilter)
        if (!group.length) return null
        const labels = { pending: '⏳ Awaiting Approval', approved: '✅ Granted', declined: '❌ Declined' }
        return (
          <div key={statusFilter} style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-h)', color: 'var(--cream-d)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              {labels[statusFilter]} ({group.length})
            </h3>
            {group.map(r => (
              <div key={r.id} className="dungeon-req">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <CategoryLabel cat={r.category} />
                    <p style={{ marginTop: '0.3rem', fontSize: '0.92rem' }}>{r.text}</p>
                    {r.master_note && (
                      <p style={{ marginTop: '0.4rem', color: 'var(--cream-d)', fontStyle: 'italic', fontSize: '0.82rem' }}>
                        Master says: "{r.master_note}"
                      </p>
                    )}
                    <p style={{ color: 'var(--cream-d)', fontSize: '0.72rem', marginTop: '0.3rem' }}>
                      {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`s-${r.status}`} style={{ fontFamily: 'var(--font-h)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {statusFilter === 'pending' ? '⏳ Pending' : statusFilter === 'approved' ? '✓ Granted' : '✗ Declined'}
                  </span>
                </div>

                {masterMode && r.status === 'pending' && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(201,168,76,0.15)' }}>
                    <input
                      className="inp"
                      placeholder="Optional note..."
                      value={notes[r.id] || ''}
                      onChange={e => setNotes(n => ({ ...n, [r.id]: e.target.value }))}
                      style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-gold btn-sm" onClick={() => handleUpdate(r.id, 'approved')}>✓ Grant</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleUpdate(r.id, 'declined')}>✗ Decline</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
