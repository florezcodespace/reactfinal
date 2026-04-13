import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import SpaceBackground from './components/SpaceBackground.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import useAuth from './context/useAuth.jsx'

const AuthPage = lazy(() => import('./pages/AuthPage.jsx'))
const Events = lazy(() => import('./pages/Events.jsx'))
const Explore = lazy(() => import('./pages/Explore.jsx'))
const Home = lazy(() => import('./pages/Home.jsx'))
const MyCosmos = lazy(() => import('./pages/MyCosmos.jsx'))

function RouteLoader() {
  return (
    <div className="px-4 pb-12 pt-2 md:px-6 md:pb-16">
      <div className="mx-auto max-w-7xl">
        <div className="glass-panel rounded-[2rem] p-6 text-sm text-slate-300 md:p-8">
          Cargando experiencia...
        </div>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return children
}

function AppShell() {
  const { user } = useAuth()

  return (
    <div className="relative min-h-screen overflow-hidden">
      <SpaceBackground />

      <div className="relative z-10">
        <Navbar />

        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore key={user?.email ?? 'guest'} />} />
            <Route path="/events" element={<Events />} />
            <Route
              path="/my-cosmos"
              element={
                <ProtectedRoute>
                  <MyCosmos />
                </ProtectedRoute>
              }
            />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
