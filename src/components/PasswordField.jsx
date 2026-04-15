import { forwardRef, useId, useState } from 'react'

const EyeIcon = ({ open }) => (
  <svg
    aria-hidden="true"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.25 12S5.25 6.75 12 6.75 21.75 12 21.75 12 18.75 17.25 12 17.25 2.25 12 2.25 12Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
    <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.5" />
    {!open && (
      <path
        d="M4 4 20 20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    )}
  </svg>
)

const PasswordField = forwardRef(function PasswordField(
  {
    className = '',
    error,
    label = 'Password',
    placeholder = 'Minimo 8 caracteres',
    wrapperClassName = 'block',
    ...props
  },
  ref,
) {
  const [isVisible, setIsVisible] = useState(false)
  const inputId = useId()

  return (
    <label className={wrapperClassName}>
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>

      <div className="relative">
        <input
          {...props}
          ref={ref}
          id={inputId}
          type={isVisible ? 'text' : 'password'}
          placeholder={placeholder}
          className={`${className} pr-12`}
        />

        <button
          type="button"
          aria-controls={inputId}
          aria-label={isVisible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40"
        >
          <EyeIcon open={isVisible} />
        </button>
      </div>

      {error && <span className="mt-2 block text-sm text-rose-300">{error}</span>}
    </label>
  )
})

export default PasswordField
