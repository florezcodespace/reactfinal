import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import useAuth from '../context/useAuth.jsx'

const initialValues = {
  name: '',
  email: '',
  password: '',
}

function AuthPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [formValues, setFormValues] = useState(initialValues)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/my-cosmos" replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((current) => ({ ...current, [name]: value }))
  }

  const handleModeChange = (nextMode) => {
    setMode(nextMode)
    setFormValues(initialValues)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        name: formValues.name || formValues.email.split('@')[0],
        email: formValues.email.trim().toLowerCase(),
        password: formValues.password,
        mode,
      }

      await new Promise((resolve) => setTimeout(resolve, 700))

      if (mode === 'register') {
        register(payload)
      } else {
        login(payload)
      }

      navigate('/my-cosmos')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="px-4 pb-12 pt-2 md:px-6 md:pb-16">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="glass-panel rounded-[2rem] p-6 md:p-8 lg:p-10">
          <p className="text-xs uppercase tracking-[0.45em] text-blue-200/75">Acceso</p>
          <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">
            Login y registro en una sola orbita
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
            Alterna entre iniciar sesion y crear cuenta sin salir de la misma vista. La peticion se
            simula localmente y luego actualiza el estado global de autenticacion.
          </p>

          <div className="mt-8 inline-flex rounded-full border border-white/10 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === 'login' ? 'bg-white/15 text-white' : 'text-slate-300'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('register')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === 'register' ? 'bg-white/15 text-white' : 'text-slate-300'
              }`}
            >
              Registro
            </button>
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-6 md:p-8 lg:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-violet-300">
            {mode === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}
          </p>
          <h2 className="mt-4 text-3xl font-bold text-white">
            {mode === 'login' ? 'Vuelve a tu panel personal' : 'Activa tu espacio privado'}
          </h2>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {mode === 'register' && (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Nombre</span>
                <input
                  required
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20"
                  placeholder="Astronauta"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
              <input
                required
                type="email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20"
                placeholder="astronauta@cosmos.dev"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
              <input
                required
                minLength={8}
                type="password"
                name="password"
                value={formValues.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                placeholder="Minimo 8 caracteres"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#60a5fa] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? 'Enviando...'
                : mode === 'login'
                  ? 'Entrar al universo'
                  : 'Crear cuenta'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default AuthPage
