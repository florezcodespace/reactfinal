import { Link, NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../context/useAuth.jsx'

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Explore', to: '/explore' },
  { label: 'Eventos', to: '/events' },
  { label: 'My Cosmos', to: '/my-cosmos' },
]
const defaultAvatar =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="%230b1220"/><circle cx="60" cy="45" r="24" fill="%2360a5fa"/><path d="M22 100c8-18 22-28 38-28s30 10 38 28" fill="%237c3aed"/></svg>'

function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <header className="sticky top-0 z-30 px-4 py-4 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-[1.9rem] px-4 py-3 md:px-5">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#60a5fa] text-sm font-bold tracking-[0.3em] text-white shadow-[0_0_35px_rgba(96,165,250,0.35)]">
              CE
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] uppercase tracking-[0.45em] text-blue-200/70">
                Cosmos Explorer
              </p>
              <p className="truncate text-sm font-semibold text-white md:text-base">
                Mission Dashboard
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white/16 text-white shadow-[0_0_25px_rgba(124,58,237,0.18)]'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10">
              <img
                src={user?.avatar || defaultAvatar}
                alt={user?.name || 'Avatar por defecto'}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-300">Sesion iniciada</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
                >
                  Cerrar sesion
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="rounded-full bg-gradient-to-r from-[#7c3aed] to-[#60a5fa] px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02]"
              >
                Login / Registro
              </Link>
            )}
          </div>
        </div>

        <nav className="glass-panel mt-3 flex gap-2 overflow-x-auto rounded-full p-2 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-white/16 text-white' : 'text-slate-300 hover:bg-white/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
