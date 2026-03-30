import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import RoyalCourt from './pages/RoyalCourt'
import ThroneRoom from './pages/ThroneRoom'
import Games from './pages/Games'
import Dungeon from './pages/Dungeon'
import HiddenChamber from './pages/HiddenChamber'
import Clicker from './games/Clicker'
import MemoryMatch from './games/MemoryMatch'
import Quiz from './games/Quiz'
//import Runner from './games/Runner'
//import Hangman from './games/Hangman'
//import TicTacToe from './games/TicTacToe'
//import Dice from './games/Dice'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<RoyalCourt />} />
        <Route path="/throne-room" element={<ThroneRoom />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/clicker" element={<Clicker />} />
        <Route path="/games/memory" element={<MemoryMatch />} />
        <Route path="/games/quiz" element={<Quiz />} />
        <Route path="/games/runner" element={<Runner />} />
        <Route path="/games/hangman" element={<Hangman />} />
        <Route path="/games/tictactoe" element={<TicTacToe />} />
        <Route path="/games/dice" element={<Dice />} />
        <Route path="/dungeon" element={<Dungeon />} />
        <Route path="/hidden-chamber" element={<HiddenChamber />} />
      </Route>
    </Routes>
  )
}
