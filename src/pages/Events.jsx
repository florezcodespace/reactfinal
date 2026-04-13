import { useEffect, useMemo, useState } from 'react'
import { isAbortError } from '../lib/http.js'
import { addDays, fetchSolarFlares, formatDateInput } from '../lib/nasa.js'

const curatedEvents = [
  {
    id: 'meteor-shower',
    title: 'Lluvia de meteoros para madrugada',
    date: '22 de abril',
    focus: 'Meteoros',
    image: 'https://images-assets.nasa.gov/image/PIA15482/PIA15482~orig.jpg',
    description:
      'Ventana ideal para observar trazos rapidos en cielos oscuros, con mejor rendimiento visual lejos de la contaminacion luminica.',
    checklist: 'Lleva manta, binoculares y una hora completa de adaptacion visual.',
  },
  {
    id: 'lunar-session',
    title: 'Sesion fotografica lunar',
    date: '07 de septiembre',
    focus: 'Luna',
    image:
      'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001861/GSFC_20171208_Archive_e001861~orig.jpg',
    description:
      'Buena oportunidad para capturar relieve, sombra y contraste en la superficie lunar con telescopios pequenos y medianos.',
    checklist: 'Usa tripode firme, disparo remoto y exposicion corta para conservar detalle.',
  },
  {
    id: 'deep-sky',
    title: 'Noche de cielo profundo',
    date: '12 de noviembre',
    focus: 'Nebulosas',
    image: 'https://images-assets.nasa.gov/image/PIA03606/PIA03606~orig.jpg',
    description:
      'Bloque pensado para observacion de nebulosas y campos estelares cuando las condiciones atmosfericas son mas limpias.',
    checklist: 'Prioriza un lugar elevado y revisa humedad, transparencia y fase lunar.',
  },
]

const solarHeroImage = 'https://images-assets.nasa.gov/image/PIA03149/PIA03149~orig.jpg'

function formatEventDate(dateTime) {
  if (!dateTime) {
    return 'Sin dato'
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateTime))
}

function getSolarStatusLabel(status) {
  if (status === 'success') {
    return 'Datos en vivo'
  }

  if (status === 'loading') {
    return 'Sincronizando'
  }

  return 'Modo estable'
}

function getSolarStatusClass(status) {
  if (status === 'success') {
    return 'border-emerald-300/20 bg-emerald-400/12 text-emerald-100'
  }

  if (status === 'loading') {
    return 'border-blue-300/20 bg-blue-300/12 text-blue-100'
  }

  return 'border-amber-300/20 bg-amber-400/12 text-amber-100'
}

function Events() {
  const [reminders, setReminders] = useState([])
  const [solarFlares, setSolarFlares] = useState([])
  const [solarStatus, setSolarStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()
    const endDate = formatDateInput(new Date())
    const startDate = formatDateInput(addDays(new Date(), -30))

    async function loadSolarFlares() {
      setSolarStatus('loading')

      try {
        const result = await fetchSolarFlares({
          signal: controller.signal,
          startDate,
          endDate,
        })

        setSolarFlares(result.items.slice(0, 3))
        setSolarStatus(result.reason)
      } catch (error) {
        if (!isAbortError(error)) {
          setSolarFlares([])
          setSolarStatus('unknown_error')
        }
      }
    }

    loadSolarFlares()

    return () => controller.abort()
  }, [])

  const toggleReminder = (eventId) => {
    setReminders((current) =>
      current.includes(eventId)
        ? current.filter((item) => item !== eventId)
        : [...current, eventId],
    )
  }

  const reminderCount = reminders.length
  const flareCount = solarFlares.length
  const featuredFlare = solarFlares[0]
  const summaryCards = useMemo(
    () => [
      {
        label: 'Agenda curada',
        value: `${curatedEvents.length} bloques`,
        detail: 'Sesiones listas para observacion real.',
      },
      {
        label: 'Alertas activas',
        value: `${reminderCount}`,
        detail: 'Recordatorios guardados en tu sesion.',
      },
      {
        label: 'Actividad solar',
        value: flareCount > 0 ? `${flareCount} registros` : 'Sin eventos',
        detail: 'Fulguraciones recientes del feed DONKI.',
      },
    ],
    [flareCount, reminderCount],
  )

  return (
    <main className="px-4 pb-12 pt-2 md:px-6 md:pb-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="glass-panel overflow-hidden rounded-[2.2rem] p-6 md:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="flex h-full flex-col justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-blue-200/75">
                  Panel de Eventos Astronomicos
                </p>
                <h1 className="mt-4 max-w-4xl text-4xl font-bold text-white md:text-5xl">
                  Agenda astronomica con imagenes reales de NASA y lectura visual equilibrada.
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                  Reune sesiones recomendadas para observacion, fotografia y seguimiento solar en un
                  formato mas ordenado, con bloques compactos que mantienen ritmo visual en toda la pagina.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {summaryCards.map((card) => (
                  <article
                    key={card.label}
                    className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.25em] text-blue-200/70">
                      {card.label}
                    </p>
                    <p className="mt-3 text-2xl font-bold text-white">{card.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{card.detail}</p>
                  </article>
                ))}
              </div>
            </div>

            <article className="relative min-h-[320px] overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/20">
              <img
                src={solarHeroImage}
                alt="Actividad solar NASA"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#050505]/35 via-[#050505]/55 to-[#050505]" />
              <div className="relative flex h-full flex-col justify-end p-6">
                <span className={`inline-flex w-fit rounded-full border px-3 py-2 text-xs uppercase tracking-[0.22em] ${getSolarStatusClass(solarStatus)}`}>
                  {getSolarStatusLabel(solarStatus)}
                </span>
                <h2 className="mt-4 max-w-xl text-3xl font-bold text-white">
                  Seguimiento solar con datos reales de NASA
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  El bloque inferior conserva una altura visual controlada y prioriza la informacion
                  mas util: clase, momento pico y zona de origen.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="grid items-stretch gap-6 xl:grid-cols-2">
          <article className="glass-panel flex h-full flex-col rounded-[2rem] p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-violet-300">
                  Agenda editorial
                </p>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  Sesiones recomendadas para mirar el cielo
                </h2>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs uppercase tracking-[0.2em] text-blue-100">
                {curatedEvents.length} sesiones
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Cada sesion combina contexto, objetivo visual y una lista corta de preparacion para
              ayudarte a planear una noche de observacion con mejor criterio.
            </p>

            <div className="mt-6 grid flex-1 gap-4">
              {curatedEvents.map((event) => {
                const isActive = reminders.includes(event.id)

                return (
                  <article
                    key={event.id}
                    className="grid min-h-[250px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/20 md:grid-cols-[0.42fr_0.58fr]"
                  >
                    <div className="relative min-h-[180px] overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/35 to-transparent" />
                      <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.18em] text-blue-100">
                        {event.focus}
                      </span>
                    </div>

                    <div className="flex h-full flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-violet-300">
                            {event.date}
                          </p>
                          <h3 className="mt-3 text-2xl font-semibold text-white">{event.title}</h3>
                        </div>
                      </div>

                      <p className="mt-4 flex-1 text-sm leading-7 text-slate-300">
                        {event.description}
                      </p>

                      <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">
                          Checklist rapido
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white">{event.checklist}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleReminder(event.id)}
                        className={`mt-4 rounded-full px-4 py-3 text-sm font-semibold transition ${
                          isActive
                            ? 'border border-emerald-300/25 bg-emerald-400/15 text-emerald-100'
                            : 'bg-gradient-to-r from-[#7c3aed] to-[#60a5fa] text-white hover:scale-[1.02]'
                        }`}
                      >
                        {isActive ? 'Recordatorio activo' : 'Guardar recordatorio'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </article>

          <article className="glass-panel flex h-full flex-col rounded-[2rem] p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-blue-200/75">
                  Actividad solar NASA
                </p>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  Fulguraciones recientes y clima espacial
                </h2>
              </div>
              <span className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.2em] ${getSolarStatusClass(solarStatus)}`}>
                {getSolarStatusLabel(solarStatus)}
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Consulta rapidamente clase, zona de origen e instante de mayor actividad solar para
              tener una referencia clara del comportamiento reciente del Sol.
            </p>

            {featuredFlare && (
              <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-[linear-gradient(135deg,rgba(249,115,22,0.18),rgba(96,165,250,0.12))] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-blue-100/80">
                  Registro destacado
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-semibold text-white">{featuredFlare.classType}</h3>
                  <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs uppercase tracking-[0.18em] text-blue-100">
                    {featuredFlare.sourceLocation}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  Ultimo pico registrado: {formatEventDate(featuredFlare.peakTime || featuredFlare.beginTime)}.
                </p>
              </div>
            )}

            <div className="mt-6 grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-1">
              {solarFlares.length === 0 ? (
                <div className="flex min-h-[260px] items-center justify-center rounded-[1.7rem] border border-dashed border-white/15 bg-black/20 p-6 text-center text-sm text-slate-300">
                  No hubo fulguraciones recientes en la ventana consultada.
                </div>
              ) : (
                solarFlares.map((flare) => (
                  <article
                    key={flare.id}
                    className="grid min-h-[220px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/20 md:grid-cols-[0.38fr_0.62fr]"
                  >
                    <div className="relative min-h-[160px] overflow-hidden">
                      <img
                        src={solarHeroImage}
                        alt={flare.classType}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/35 to-transparent" />
                    </div>

                    <div className="flex h-full flex-col p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-2xl font-semibold text-white">{flare.classType}</h3>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-blue-100">
                          {flare.sourceLocation}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">Inicio</p>
                          <p className="mt-2 text-sm font-medium text-white">
                            {formatEventDate(flare.beginTime)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">Pico</p>
                          <p className="mt-2 text-sm font-medium text-white">
                            {formatEventDate(flare.peakTime || flare.beginTime)}
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-300">
                        Eventos vinculados: {flare.linkedEvents}
                      </p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}

export default Events
