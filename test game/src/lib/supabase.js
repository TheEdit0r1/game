import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null
let usingLocal = false

if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') {
  supabase = createClient(supabaseUrl, supabaseKey)
} else {
  usingLocal = true
}

// --- localStorage helpers ---
function localGet(key, def) {
  try { return JSON.parse(localStorage.getItem('rg_' + key)) ?? def } catch { return def }
}
function localSet(key, val) {
  localStorage.setItem('rg_' + key, JSON.stringify(val))
}
function uid() { return Date.now() + Math.random().toString(36).slice(2) }

// --- Profile ---
export async function getProfile() {
  if (usingLocal) {
    let p = localGet('profile', null)
    if (!p) {
      p = { id: 'local', total_points: 0, master_pin: null, created_at: new Date().toISOString() }
      localSet('profile', p)
    }
    return p
  }
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1).single()
    if (error) {
      const { data: np } = await supabase.from('profiles').insert({ total_points: 0 }).select().single()
      return np
    }
    return data
  } catch { return null }
}

export async function addPointsToDb(profileId, amount, source) {
  if (usingLocal) {
    const p = localGet('profile', { total_points: 0 })
    const newTotal = Math.max(0, (p.total_points || 0) + amount)
    localSet('profile', { ...p, total_points: newTotal })
    const evts = localGet('point_events', [])
    evts.unshift({ id: uid(), source, amount, created_at: new Date().toISOString() })
    localSet('point_events', evts.slice(0, 200))
    return
  }
  try {
    await supabase.from('point_events').insert({ source, amount })
    const { data: prof } = await supabase.from('profiles').select('total_points').eq('id', profileId).single()
    if (prof) {
      await supabase.from('profiles').update({ total_points: Math.max(0, prof.total_points + amount) }).eq('id', profileId)
    }
  } catch {}
}

// --- Prize claims ---
export async function claimPrize(profileId, prizeData) {
  if (usingLocal) {
    const claims = localGet('prize_claims', [])
    const claim = { id: uid(), prize_id: prizeData.id, prize: prizeData, status: 'pending', master_note: null, claimed_at: new Date().toISOString() }
    claims.unshift(claim)
    localSet('prize_claims', claims)
    return claim
  }
  try {
    const { data } = await supabase.from('prize_claims').insert({ prize_id: prizeData.id, status: 'pending' }).select('*, prizes(*)').single()
    return data
  } catch { return null }
}

export async function getPrizeClaims() {
  if (usingLocal) {
    return localGet('prize_claims', [])
  }
  try {
    const { data } = await supabase.from('prize_claims').select('*, prizes(*)').order('claimed_at', { ascending: false })
    return data || []
  } catch { return [] }
}

export async function updateClaimStatus(claimId, status, note = null) {
  if (usingLocal) {
    const claims = localGet('prize_claims', [])
    localSet('prize_claims', claims.map(c => c.id === claimId ? { ...c, status, master_note: note } : c))
    return
  }
  try {
    await supabase.from('prize_claims').update({ status, master_note: note }).eq('id', claimId)
  } catch {}
}

// --- Master PIN ---
export async function getMasterPin() {
  if (usingLocal) {
    return localGet('profile', {})?.master_pin || null
  }
  try {
    const { data } = await supabase.from('profiles').select('master_pin').limit(1).single()
    return data?.master_pin || null
  } catch { return null }
}

export async function setMasterPin(profileId, pin) {
  if (usingLocal) {
    const p = localGet('profile', {})
    localSet('profile', { ...p, master_pin: pin })
    return
  }
  try {
    await supabase.from('profiles').update({ master_pin: pin }).eq('id', profileId)
  } catch {}
}

// --- Dungeon ---
export async function getDungeonRequests() {
  if (usingLocal) return localGet('dungeon_requests', [])
  try {
    const { data } = await supabase.from('dungeon_requests').select('*').order('created_at', { ascending: false })
    return data || []
  } catch { return [] }
}

export async function addDungeonRequest(text, category) {
  if (usingLocal) {
    const reqs = localGet('dungeon_requests', [])
    const req = { id: uid(), text, category, status: 'pending', master_note: null, created_at: new Date().toISOString() }
    reqs.unshift(req)
    localSet('dungeon_requests', reqs)
    return req
  }
  try {
    const { data } = await supabase.from('dungeon_requests').insert({ text, category, status: 'pending' }).select().single()
    return data
  } catch { return null }
}

export async function updateDungeonRequest(id, status, note = null) {
  if (usingLocal) {
    const reqs = localGet('dungeon_requests', [])
    localSet('dungeon_requests', reqs.map(r => r.id === id ? { ...r, status, master_note: note } : r))
    return
  }
  try {
    await supabase.from('dungeon_requests').update({ status, master_note: note }).eq('id', id)
  } catch {}
}

// --- Dice tasks ---
export async function getDiceTasks() {
  if (!usingLocal) {
    try {
      const { data } = await supabase.from('dice_tasks').select('*')
      if (data?.length) return data
    } catch {}
  }
  return [
    { id: 1, task_text: "Master must bow for 10 seconds 👑" },
    { id: 2, task_text: "Master must compliment the Queen 3 times in a row" },
    { id: 3, task_text: "Master must ask permission before speaking for the next 5 minutes" },
    { id: 4, task_text: "Master must fetch the Queen a snack or drink of her choice" },
    { id: 5, task_text: "Master must write \"I serve the Queen\" 10 times and show proof" },
    { id: 6, task_text: "Master must perform a dramatic bow: \"As you wish, Your Highness\"" },
    { id: 7, task_text: "Queen decides the next activity — Master has no vote for 30 minutes" },
    { id: 8, task_text: "Master must speak only in compliments for the next 3 minutes" },
    { id: 9, task_text: "The Queen gets to choose any task she likes — Master obeys without question" },
    { id: 10, task_text: "Master must send a voice note confessing his devotion to the Queen" },
  ]
}

// --- Quiz questions ---
export async function getQuizQuestions() {
  if (!usingLocal) {
    try {
      const { data } = await supabase.from('quiz_questions').select('*')
      if (data?.length) return data
    } catch {}
  }
  return DEFAULT_QUIZ_QUESTIONS
}

export const DEFAULT_QUIZ_QUESTIONS = [
  { id: 1, question: "What colour does the Queen favour above all others?", answers: ["Red", "Blue", "Purple", "Green"], correct_index: 1 },
  { id: 2, question: "What does a loyal subject do when the Queen demands attention?", answers: ["Ask why", "Whatever she says", "Check his schedule", "Negotiate"], correct_index: 1 },
  { id: 3, question: "What is the Queen's favourite genre of TV?", answers: ["Reality shows", "Documentaries", "K-dramas", "Cartoons"], correct_index: 2 },
  { id: 4, question: "If the Queen wants to go out, what does Master say?", answers: ["Maybe later", "Let me think", "Yes, Your Highness", "I'm busy"], correct_index: 2 },
  { id: 5, question: "How many lives does a cat have?", answers: ["7", "9", "12", "3"], correct_index: -1 },
  { id: 6, question: "What does a good subject do with his eyes?", answers: ["Look away", "Stare boldly", "Whatever the Queen allows", "Close them"], correct_index: 2 },
  { id: 7, question: "What is the Queen's favourite colour?", answers: ["Gold", "Pink", "Blue", "Purple"], correct_index: 2 },
  { id: 8, question: "If the Queen is bored, what is the solution?", answers: ["Give her space", "Entertain her immediately", "Suggest a book", "Watch TV alone"], correct_index: 1 },
  { id: 9, question: "What does Master do when June speaks?", answers: ["Checks his phone", "Listens carefully", "Interrupts with ideas", "Nods vacantly"], correct_index: 1 },
  { id: 10, question: "True loyalty means...?", answers: ["Agreeing sometimes", "Being available weekends", "Putting June first, always", "Trying your best"], correct_index: 2 },
  { id: 11, question: "Who is always right?", answers: ["The subject", "The Queen", "Both equally", "Neither"], correct_index: -1 },
  { id: 12, question: "When the Queen issues a command, how quickly should it be followed?", answers: ["Eventually", "When convenient", "Immediately", "After discussion"], correct_index: 2 },
  { id: 13, question: "What is a Royal Coin used for?", answers: ["Buying coffee", "Redeeming prizes in the Throne Room", "Trading with merchants", "Paying taxes"], correct_index: 1 },
  { id: 14, question: "What is the highest prize tier?", answers: ["Grand Reward", "Queen's Favour", "Legendary", "Royal Treat"], correct_index: 2 },
  { id: 15, question: "What happens in The Royal Dungeon?", answers: ["Games are played", "Punishments carried out", "Wishes submitted and granted", "Coins are stored"], correct_index: 2 },
  { id: 16, question: "What symbol represents the Queen in Tic Tac Toe?", answers: ["X", "O", "👑", "🐾"], correct_index: 2 },
  { id: 17, question: "What symbol represents Master in Tic Tac Toe?", answers: ["X", "🐾", "💎", "👑"], correct_index: 1 },
  { id: 18, question: "How many points for rolling a 6 on the dice?", answers: ["35", "50", "75", "100"], correct_index: 2 },
  { id: 19, question: "What is June's most important quality?", answers: ["Everything", "Absolutely everything", "All of the above", "Her perfection"], correct_index: -1 },
  { id: 20, question: "What does Master say when the Queen is unhappy?", answers: ["It will pass", "I'll fix it immediately, Your Highness", "Calm down", "That's not fair"], correct_index: 1 },
]

export { supabase }
