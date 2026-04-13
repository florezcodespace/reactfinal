import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres.'),
  email: z.email('Ingresa un correo electronico valido.'),
  password: z
    .string()
    .min(8, 'La contrasena debe tener al menos 8 caracteres.')
    .regex(/[A-Z]/, 'La contrasena debe incluir al menos una letra mayuscula.')
    .regex(/\d/, 'La contrasena debe incluir al menos un numero.'),
})

function Register() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
    mode: 'onBlur',
  })

  const onSubmit = async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.info('Registro validado', values)
    reset()
  }

  return (
    <section className="w-full rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl md:p-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.35em] text-nebula-400">
          Tripulacion
        </p>
        <h2 className="mt-2 text-3xl font-bold text-white">Registro espacial</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Crea tu acceso para guardar exploraciones, recibir contenido de la NASA y continuar tu
          viaje en modo instalable.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Username</span>
          <input
            type="text"
            {...register('username')}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-aurora-400/60 focus:ring-2 focus:ring-aurora-400/20"
            placeholder="astroexplorer"
          />
          {errors.username && (
            <span className="mt-2 block text-sm text-rose-300">{errors.username.message}</span>
          )}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
          <input
            type="email"
            {...register('email')}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-aurora-400/60 focus:ring-2 focus:ring-aurora-400/20"
            placeholder="tu@cosmosportal.dev"
          />
          {errors.email && (
            <span className="mt-2 block text-sm text-rose-300">{errors.email.message}</span>
          )}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
          <input
            type="password"
            {...register('password')}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-aurora-400/60 focus:ring-2 focus:ring-aurora-400/20"
            placeholder="Minimo 8 caracteres"
          />
          {errors.password && (
            <span className="mt-2 block text-sm text-rose-300">{errors.password.message}</span>
          )}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-gradient-to-r from-aurora-500 via-sky-500 to-nebula-500 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
        </button>

        {isSubmitSuccessful && (
          <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            Registro validado correctamente. Ya puedes conectar tu siguiente modulo de autenticacion.
          </p>
        )}
      </form>
    </section>
  )
}

export default Register
