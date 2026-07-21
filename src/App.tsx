import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Planets from './pages/Planets'
import PlanetDetail from './pages/PlanetDetail'
import Scale from './pages/Scale'
import About from './pages/About'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="planets" element={<Planets />} />
        <Route path="planets/:slug" element={<PlanetDetail />} />
        <Route path="scale" element={<Scale />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  )
}
