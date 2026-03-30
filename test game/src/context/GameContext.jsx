import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { getProfile, addPointsToDb } from '../lib/supabase'

const GameContext = createContext(null)

const MASTER_MULTIPLIER = 1.5

const init = {
  profileId: null,
  totalPoints: 0,
  loading: true,
  masterMode: false,
  blueMode: false,
  crownClicks: 0,
  blueClicks: 0,
  loyalDogWins: 0,
  toasts: [],
  secretToast: null,
}

function reducer(s, a) {
  switch (a.type) {
    case 'SET_PROFILE': return { ...s, profileId: a.id, totalPoints: a.points, loading: false }
    case 'ADD_POINTS': return { ...s, totalPoints: s.totalPoints + a.amount }
    case 'DEDUCT_POINTS': return { ...s, totalPoints: Math.max(0, s.totalPoints - a.amount) }
    case 'ACTIVATE_MASTER': return { ...s, masterMode: true, crownClicks: 0 }
    case 'TOGGLE_BLUE': return { ...s, blueMode: !s.blueMode }
    case 'INC_CROWN': return { ...s, crownClicks: s.crownClicks + 1 }
    case 'INC_BLUE': return { ...s, blueClicks: s.blueClicks + 1 }
    case 'INC_DOG': return { ...s, loyalDogWins: s.loyalDogWins + 1 }
    case 'RESET_DOG': return { ...s, loyalDogWins: 0 }
    case 'ADD_TOAST': return { ...s, toasts: [...s.toasts, { id: Date.now() + Math.random(), ...a.data }] }
    case 'POP_TOAST': return { ...s, toasts: s.toasts.filter(t => t.id !== a.id) }
    case 'SET_SECRET': return { ...s, secretToast: a.msg }
    case 'CLEAR_SECRET': return { ...s, secretToast: null }
    default: return s
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init)

  useEffect(() => { loadProfile() }, [])

  useEffect(() => {
    document.body.classList.toggle('blue-mode', state.blueMode)
  }, [state.blueMode])

  useEffect(() => {
    if (!state.toasts.length) return
    const t = state.toasts[state.toasts.length - 1]
    const timer = setTimeout(() => dispatch({ type: 'POP_TOAST', id: t.id }), 3200)
    return () => clearTimeout(timer)
  }, [state.toasts])

  async function loadProfile() {
    const p = await getProfile()
    dispatch({ type: 'SET_PROFILE', id: p?.id ?? null, points: p?.total_points ?? 0 })
  }

  const addPoints = useCallback(async (amount, source = 'game') => {
    const final = state.masterMode ? Math.floor(amount * MASTER_MULTIPLIER) : amount
    dispatch({ type: 'ADD_POINTS', amount: final })
    dispatch({ type: 'ADD_TOAST', data: { msg: `+${final} Royal Coins 🪙`, kind: 'pts' } })
    await addPointsToDb(state.profileId, final, source)
  }, [state.profileId, state.masterMode])

  const deductPoints = useCallback(async (amount) => {
    if (state.totalPoints < amount) return false
    dispatch({ type: 'DEDUCT_POINTS', amount })
    await addPointsToDb(state.profileId, -amount, 'prize_claim')
    return true
  }, [state.profileId, state.totalPoints])

  const showSecret = useCallback((msg) => {
    dispatch({ type: 'SET_SECRET', msg })
    setTimeout(() => dispatch({ type: 'CLEAR_SECRET' }), 4200)
  }, [])

  const handleCrownClick = useCallback(() => {
    const next = state.crownClicks + 1
    dispatch({ type: 'INC_CROWN' })
    if (next >= 7 && !state.masterMode) {
      dispatch({ type: 'ACTIVATE_MASTER' })
      showSecret('👑 Master Mode Activated!\n+50% Bonus Points for this session')
    }
  }, [state.crownClicks, state.masterMode, showSecret])

  const handleBlueClick = useCallback(() => {
    const next = state.blueClicks + 1
    dispatch({ type: 'INC_BLUE' })
    if (next >= 3) {
      dispatch({ type: 'TOGGLE_BLUE' })
      showSecret(state.blueMode ? '💙 Blue Mode Deactivated' : "💙 The Queen's Colours!\nBlue Mode Activated")
    }
  }, [state.blueClicks, state.blueMode, showSecret])

  const handleLoyalDogWin = useCallback(() => {
    const next = state.loyalDogWins + 1
    dispatch({ type: 'INC_DOG' })
    if (next >= 3) {
      dispatch({ type: 'RESET_DOG' })
      showSecret('A loyal subject. Always. 🐾')
      window.dispatchEvent(new CustomEvent('loyal-dog'))
    }
  }, [state.loyalDogWins, showSecret])

  const resetLoyalDog = useCallback(() => dispatch({ type: 'RESET_DOG' }), [])

  return (
    <GameContext.Provider value={{
      ...state,
      addPoints,
      deductPoints,
      showSecret,
      handleCrownClick,
      handleBlueClick,
      handleLoyalDogWin,
      resetLoyalDog,
      refreshProfile: loadProfile,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame outside GameProvider')
  return ctx
}
