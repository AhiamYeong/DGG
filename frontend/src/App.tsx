import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import MapTestPage from './pages/MapTestPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/map-test" element={<MapTestPage />} />
      </Routes>
    </Layout>
  )
}

export default App
