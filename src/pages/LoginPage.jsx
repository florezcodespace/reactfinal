import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import PasswordField from '../components/PasswordField.jsx'
import useAuth from '../context/useAuth.jsx'

const loginSchema = z.object({
  email: z.email('Ingresa un correo valido.'),
  password: z
    .string()
    .min(8, 'La contrasena debe tener minimo 8 caracteres.')
    .regex(/[A-Z]/, 'La contrasena debe incluir al menos una mayuscula.')
    .regex(/\d/, 'La contrasena debe incluir al menos un numero.'),
})

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  })

  const onSubmit = async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    login(values)
    navigate('/')
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-glow backdrop-blur-2xl lg:grid-cols-2">
        <section className="relative hidden min-h-[720px] overflow-hidden lg:block">
          <img
            src="https://images-assets.nasa.gov/image/iss071e414936/iss071e414936~orig.jpg"
            alt="Vista espacial"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-[#050505]/35 to-blue-900/55" />
          <div className="relative flex h-full flex-col justify-between p-10">
            <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-blue-100 backdrop-blur">
              Cosmos Portal Access
            </div>

            <div className="max-w-lg">
              <p className="text-sm uppercase tracking-[0.35em] text-blue-200/85">
                Social Space Login
              </p>
              <h1 className="mt-4 text-5xl font-bold leading-tight text-white">
                Entra al portal y sincroniza tu perfil con la exploracion del universo.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-200">
                Una experiencia tipo red social para descubrir imagenes, guardar intereses y
                personalizar tu travesia astronomica en cualquier dispositivo.
              </p>
            </div>
          </div>
        </section>

        <section className="flex min-h-[720px] items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <p className="text-xs uppercase tracking-[0.35em] text-violet-300">Iniciar sesion</p>
            <h2 className="mt-3 text-4xl font-bold text-white">Tu acceso al cosmos.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Usa tus credenciales para desbloquear una experiencia personalizada en la PWA.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20"
                  placeholder="astronauta@cosmosportal.dev"
                />
                {errors.email && (
                  <span className="mt-2 block text-sm text-rose-300">{errors.email.message}</span>
                )}
              </label>

              <PasswordField
                {...register('password')}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                error={errors.password?.message}
                placeholder="********"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-400 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Accediendo...' : 'Acceder a mi perfil'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}

export default LoginPage
