import { Routes, Route, Navigate } from 'react-router-dom'

// Placeholder pages — will be replaced in later phases
function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-700 mb-4">Roadmapper AI</h1>
        <p className="text-gray-600 text-lg">AI-Powered Course Builder</p>
        <p className="mt-2 text-sm text-gray-400">Phase 01 — Foundation Complete ✓</p>
      </div>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="text-gray-600 mt-4">Page not found</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* Auth routes — Phase 02 */}
      {/* <Route path="/login" element={<LoginPage />} /> */}
      {/* <Route path="/register" element={<RegisterPage />} /> */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
