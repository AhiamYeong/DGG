import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Chat from './pages/Chat'
import MapTestPage from './pages/MapTestPage'
import MSWTest from './components/MSWTest'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/map-test" element={<MapTestPage />} />
        <Route path="/msw-test" element={<MSWTest />} />
      </Routes>
    </Layout>
  )
}

export default App
