import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { appConfig } from '../config/appConfig.js'
import {
  FALLBACK_APOD,
  addDays,
  fetchApod,
  fetchNeoFeed,
  formatDateInput,
  getRandomApodDate,
} from '../lib/nasa.js'
import { isAbortError } from '../lib/http.js'

const gravityByWorld = [
  { name: 'Marte', factor: 0.38, accent: 'from-orange-400/80 to-rose-300/80' },
  { name: 'Jupiter', factor: 2.34, accent: 'from-amber-300/80 to-yellow-100/80' },
  { name: 'Luna', factor: 0.16, accent: 'from-sky-300/80 to-slate-100/80' },
]

const moonPhases = [
  'Luna nueva',
  'Luna creciente',
  'Cuarto creciente',
  'Gibosa creciente',
  'Luna llena',
  'Gibosa menguante',
  'Cuarto menguante',
  'Luna menguante',
]

const travelDestinations = [
  {
    id: 'moon',
    name: 'Luna',
    distanceKm: 384400,
    window: 'Ventana flexible',
    challenge: 'Microgravedad y radiacion',
    overview: 'Ruta corta para una mision de practica, aterrizaje y retorno controlado.',
    highlight: 'Exploracion tripulada de baja latencia',
  },
  {
    id: 'mars',
    name: 'Marte',
    distanceKm: 225000000,
    window: 'Cada 26 meses',
    challenge: 'Soporte vital prolongado',
    overview: 'Destino ideal para pensar una base humana y operaciones cientificas extendidas.',
    highlight: 'Colonizacion y laboratorio de superficie',
  },
  {
    id: 'europa',
    name: 'Europa',
    distanceKm: 628300000,
    window: 'Trayecto asistido',
    challenge: 'Radiacion y autonomia robotica',
    overview: 'Mision profunda con foco cientifico y alto potencial para estudiar vida microbiana.',
    highlight: 'Exploracion robotica del oceano subsuperficial',
  },
]

const propulsionProfiles = [
  {
    id: 'chemical',
    label: 'Quimico',
    speedKph: 28000,
    summary: 'Perfil realista basado en tecnologia orbital actual.',
  },
  {
    id: 'assist',
    label: 'Asistencia',
    speedKph: 58000,
    summary: 'Ruta optimizada con maniobras gravitacionales.',
  },
  {
    id: 'advanced',
    label: 'Avanzado',
    speedKph: 250000,
    summary: 'Escenario conceptual para reducir tiempos de mision.',
  },
]

function getMoonPhase(date = new Date()) {
  const lunarCycle = 29.53058867
  const referenceNewMoon = new Date('2024-01-11T11:57:00Z')
  const daysSinceReference = (date.getTime() - referenceNewMoon.getTime()) / 86400000
  const normalizedAge = ((daysSinceReference % lunarCycle) + lunarCycle) % lunarCycle
  const phaseIndex = Math.round((normalizedAge / lunarCycle) * 8) % 8

  return {
    name: moonPhases[phaseIndex],
    age: normalizedAge,
    illumination: Math.round((1 - Math.cos((2 * Math.PI * normalizedAge) / lunarCycle)) * 50),
  }
}

function formatDisplayDate(value) {
  if (!value || value === 'Fallback local') {
    return value || 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function formatLargeNumber(value) {
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
  }).format(value)
}

function formatTravelDuration(hours) {
  if (hours < 48) {
    return `${Math.round(hours)} horas`
  }

  const days = hours / 24

  if (days < 730) {
    return `${days.toFixed(1)} dias`
  }

  return `${(days / 365).toFixed(1)} anos`
}

function statusBadgeClass(reason) {
  if (reason === 'success' || reason === 'ready') {
    return 'border-emerald-300/20 bg-emerald-400/12 text-emerald-100'
  }

  if (reason === 'loading') {
    return 'border-blue-300/20 bg-blue-300/12 text-blue-100'
  }

  if (
    reason === 'missing_key' ||
    reason === 'nasa_key_rejected' ||
    reason === 'nasa_rate_limited'
  ) {
    return 'border-amber-300/20 bg-amber-400/12 text-amber-100'
  }

  return 'border-rose-300/20 bg-rose-400/12 text-rose-100'
}

function getStatusLabel(reason) {
  const labels = {
    success: 'En vivo',
    loading: 'Cargando',
    missing_key: 'Sin API key',
    nasa_key_rejected: 'API key rechazada',
    nasa_rate_limited: 'Limite temporal',
    nasa_server_error: 'NASA no disponible',
    nasa_not_found: 'Sin resultados',
    network_error: 'Sin conexion',
    nasa_request_error: 'Error de consulta',
    unknown_error: 'Error inesperado',
  }

  return labels[reason] || 'Modo estable'
}

function Home() {
  const today = formatDateInput(new Date())
  const tomorrow = formatDateInput(addDays(new Date(), 1))

  const [apod, setApod] = useState(FALLBACK_APOD)
  const [apodDate, setApodDate] = useState(today)
  const [sourceLabel, setSourceLabel] = useState('Fallback local')
  const [apiStatus, setApiStatus] = useState('listo')
  const [earthWeight, setEarthWeight] = useState('70')
  const [neoObjects, setNeoObjects] = useState([])
  const [neoStatus, setNeoStatus] = useState('loading')
  const [selectedDestinationId, setSelectedDestinationId] = useState('mars')
  const [selectedPropulsionId, setSelectedPropulsionId] = useState('assist')

  useEffect(() => {
    const controller = new AbortController()

    async function loadApod() {
      setApiStatus('loading')

      try {
        const result = await fetchApod({
          signal: controller.signal,
          date: apodDate,
        })

        setApod(result.data)
        setSourceLabel(result.sourceLabel)
        setApiStatus(result.reason)
      } catch (error) {
        if (!isAbortError(error)) {
          setApod(FALLBACK_APOD)
          setSourceLabel('Fallback por error inesperado')
          setApiStatus('unknown_error')
        }
      }
    }

    loadApod()

    return () => controller.abort()
  }, [apodDate])

  useEffect(() => {
    const controller = new AbortController()

    async function loadNeoFeed() {
      setNeoStatus('loading')

      try {
        const result = await fetchNeoFeed({
          signal: controller.signal,
          startDate: today,
          endDate: tomorrow,
        })

        setNeoObjects(result.items)
        setNeoStatus(result.reason)
      } catch (error) {
        if (!isAbortError(error)) {
          setNeoObjects([])
          setNeoStatus('unknown_error')
        }
      }
    }

    loadNeoFeed()

    return () => controller.abort()
  }, [today, tomorrow])

  const parsedWeight = Number(earthWeight)
  const moonPhase = getMoonPhase()
  const isVideoApod = apod.media_type === 'video'
  const isDirectVideo = isVideoApod && /\.(mp4|webm|ogg)$/i.test(apod.url)
  const selectedDestination =
    travelDestinations.find((destination) => destination.id === selectedDestinationId) ??
    travelDestinations[0]
  const selectedPropulsion =
    propulsionProfiles.find((profile) => profile.id === selectedPropulsionId) ??
    propulsionProfiles[0]
  const travelHours = selectedDestination.distanceKm / selectedPropulsion.speedKph
  const travelMetrics = [
    { label: 'Distancia', value: `${formatLargeNumber(selectedDestination.distanceKm)} km` },
    { label: 'Duracion', value: formatTravelDuration(travelHours) },
    { label: 'Ventana', value: selectedDestination.window },
    { label: 'Reto', value: selectedDestination.challenge },
  ]
  const heroStats = [
    { label: 'APOD', value: sourceLabel },
    { label: 'Ruta', value: selectedDestination.name },
    { label: 'Radar NEO', value: `${neoObjects.length || 0} objetos` },
  ]
  const repoUrl = appConfig.repoUrl
  const deployUrl = appConfig.deployUrl

  return (
    <main className="px-4 pb-14 pt-2 md:px-6 md:pb-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="glass-panel overflow-hidden rounded-[2.2rem] px-6 py-8 md:px-10 md:py-12">
          <div className="grid-sheen" />
          <div className="orb-decor orb-one" />
          <div className="orb-decor orb-two" />

          <div className="relative grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-4xl">
              <p className="text-xs uppercase tracking-[0.5em] text-blue-200/75">
                Dashboard Principal
              </p>
              <h1 className="hero-title mt-4 text-5xl font-black uppercase leading-none md:text-7xl xl:text-8xl">
                COSMOS EXPLORER
              </h1>
              <div className="hero-title-flare" />
              <p className="hero-copy mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Un observatorio digital con datos vivos de NASA: APOD navegable por fecha, radar
                de asteroides cercanos, rutas de viaje simuladas y herramientas locales para seguir
                tu propio viaje por el cosmos.
              </p>

              <div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.25em] text-slate-200/90">
                <span className="rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-2 backdrop-blur">
                  APOD dinamico
                </span>
                <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-2 backdrop-blur">
                  Ruta espacial
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur">
                  Asteroides cercanos
                </span>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/events"
                  className="rounded-full bg-gradient-to-r from-[#7c3aed] to-[#60a5fa] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
                >
                  Ver eventos astronomicos
                </Link>
                <Link
                  to="/my-cosmos"
                  className="rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  Ir a My Cosmos
                </Link>
                <button
                  type="button"
                  onClick={() => setApodDate(getRandomApodDate())}
                  className="rounded-full border border-blue-300/20 bg-blue-300/10 px-5 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-300/20"
                >
                  APOD aleatoria
                </button>
                {repoUrl ? (
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
                  >
                    Repo GitHub
                  </a>
                ) : (
                  <span className="rounded-full border border-emerald-300/15 bg-emerald-400/5 px-5 py-3 text-sm font-semibold text-emerald-100/80">
                    Repo GitHub por configurar
                  </span>
                )}
                {deployUrl ? (
                  <a
                    href={deployUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                  >
                    Vinculo
                  </a>
                ) : (
                  <span className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200/80">
                    Vinculo por configurar
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {heroStats.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-[1.7rem] border border-white/10 bg-black/20 p-5 backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-blue-200/70">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-white">{stat.value}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
          <article className="glass-panel overflow-hidden rounded-[2rem] p-3 md:p-4">
            <div className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-black/30">
              <div className="relative aspect-[16/10] overflow-hidden bg-black md:aspect-[16/9]">
                {isDirectVideo ? (
                  <video
                    src={apod.url}
                    poster={FALLBACK_APOD.url}
                    controls
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : isVideoApod ? (
                  <iframe
                    src={apod.url}
                    title={apod.title}
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={apod.url}
                    alt={apod.title}
                    fetchPriority="high"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.32em] text-slate-100/85">
                  <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1">
                    APOD
                  </span>
                  <span>{formatDisplayDate(apod.date)}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {apod.media_type}
                  </span>
                  <span className={`rounded-full border px-3 py-1 ${statusBadgeClass(apiStatus)}`}>
                    {getStatusLabel(apiStatus)}
                  </span>
                </div>

                <div className="mt-5 max-w-4xl">
                  <p className="mb-3 text-xs uppercase tracking-[0.35em] text-blue-100/70">
                    Centro de observacion en tiempo real
                  </p>
                  <h2 className="text-3xl font-bold leading-tight text-white md:text-5xl">
                    {apod.title}
                  </h2>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                    {apod.explanation}
                  </p>
                </div>
              </div>
            </div>
          </article>

          <aside className="glass-panel rounded-[2rem] p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-violet-300">Control APOD</p>
            <h3 className="mt-4 text-3xl font-bold text-white">Explora la imagen del dia por fecha</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Explora el archivo historico de Astronomy Picture of the Day, compara distintas
              fechas y abre el recurso original cuando quieras revisar la publicacion completa.
            </p>

            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Fecha APOD</span>
              <input
                type="date"
                max={today}
                value={apodDate}
                onChange={(event) => setApodDate(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20"
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setApodDate(today)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
              >
                Volver a hoy
              </button>
              <button
                type="button"
                onClick={() => setApodDate(getRandomApodDate())}
                className="rounded-full border border-blue-300/20 bg-blue-300/10 px-4 py-2 text-sm font-medium text-blue-100 transition hover:bg-blue-300/20"
              >
                Elegir aleatoria
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200/70">Fuente</p>
                <p className="mt-2 text-sm font-medium text-white">{sourceLabel}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200/70">Media</p>
                <p className="mt-2 text-sm font-medium text-white">{apod.media_type}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200/70">Credito</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {apod.copyright || 'NASA'}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200/70">
                  Estado del feed
                </p>
                <p className="mt-2 text-sm font-medium text-white">{apiStatus}</p>
                <p className="mt-1 text-xs text-slate-400">{getStatusLabel(apiStatus)}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-[linear-gradient(135deg,rgba(96,165,250,0.08),rgba(124,58,237,0.12))] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-blue-100/75">
                Nota de visualizacion
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                Cuando APOD devuelve video, el reproductor se muestra limpio arriba y la ficha se
                mantiene separada para que puedas leer sin que los controles se crucen con el texto.
              </p>
            </div>

            <a
              href={apod.hdurl || apod.url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#7c3aed] to-[#60a5fa] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] sm:w-auto"
            >
              Abrir recurso original
            </a>
          </aside>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <article className="glass-panel rounded-[2rem] p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-blue-200/75">
                  Radar cercano
                </p>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  Asteroides proximos a la Tierra
                </h2>
              </div>
              <span className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.25em] ${statusBadgeClass(neoStatus)}`}>
                {getStatusLabel(neoStatus)}
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Feed basado en NeoWs para seguir objetos proximos entre hoy y manana. Se priorizan
              los de menor distancia de paso para una lectura mas util.
            </p>

            <div className="mt-6 space-y-4">
              {neoObjects.slice(0, 4).map((object) => (
                <article
                  key={object.id}
                  className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-violet-300">
                        {formatDisplayDate(object.approachDate)}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{object.name}</h3>
                    </div>
                    <span
                      className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                        object.hazardous
                          ? 'border border-rose-300/20 bg-rose-400/12 text-rose-100'
                          : 'border border-emerald-300/20 bg-emerald-400/12 text-emerald-100'
                      }`}
                    >
                      {object.hazardous ? 'Potencialmente peligroso' : 'Monitoreado'}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">
                        Distancia
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {formatLargeNumber(object.missDistanceKm)} km
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">
                        Velocidad
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {formatLargeNumber(object.velocityKph)} km/h
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">
                        Diametro
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {formatLargeNumber(object.diameterMeters)} m
                      </p>
                    </div>
                  </div>

                  <a
                    href={object.nasaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
                  >
                    Ver detalle NASA
                  </a>
                </article>
              ))}
            </div>
          </article>

          <article className="glass-panel rounded-[2rem] p-6 md:p-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.35em] text-violet-300">
                  Simulador de viaje
                </p>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  Planifica una ruta interplanetaria
                </h2>
              </div>

              <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-100">
                Funcion local estable
              </div>
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Ajusta el destino y el perfil de propulsion para comparar tiempos de viaje, ventanas
              de lanzamiento y complejidad operativa en misiones hacia la Luna, Marte o Europa.
            </p>

            <div className="mt-6 space-y-5">
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-blue-200/70">
                    Destino
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {travelDestinations.map((destination) => (
                      <button
                        key={destination.id}
                        type="button"
                        onClick={() => setSelectedDestinationId(destination.id)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          selectedDestination.id === destination.id
                            ? 'bg-white/15 text-white'
                            : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {destination.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-blue-200/70">
                    Propulsion
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {propulsionProfiles.map((profile) => (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => setSelectedPropulsionId(profile.id)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          selectedPropulsion.id === profile.id
                            ? 'bg-white/15 text-white'
                            : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {profile.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    {selectedPropulsion.summary}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(135deg,rgba(96,165,250,0.08),rgba(124,58,237,0.14))] p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs uppercase tracking-[0.25em] text-violet-300">
                      Destino activo
                    </p>
                    <h3 className="mt-3 text-3xl font-semibold text-white">
                      {selectedDestination.name}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-300">
                      {selectedDestination.overview}
                    </p>
                  </div>

                  <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-blue-200/70">
                      Mision sugerida
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {selectedDestination.highlight}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {travelMetrics.map((metric) => (
                    <article
                      key={metric.label}
                      className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.22em] text-blue-200/70">
                        {metric.label}
                      </p>
                      <p className="mt-3 text-lg font-semibold text-white">{metric.value}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr]">
          <article className="glass-panel rounded-[2rem] p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-blue-200/75">
              Calculadora local
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white">
              Calculadora de peso en otros planetas
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Introduce tu peso terrestre en kilogramos y compara el efecto gravitacional de Marte,
              Jupiter y la Luna al instante.
            </p>

            <label className="mt-6 block max-w-xs">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Peso en la Tierra (kg)
              </span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={earthWeight}
                onChange={(event) => setEarthWeight(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20"
                placeholder="70"
              />
            </label>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {gravityByWorld.map((world) => (
                <div
                  key={world.name}
                  className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5"
                >
                  <div
                    className={`inline-flex rounded-full bg-gradient-to-r ${world.accent} px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-950`}
                  >
                    {world.name}
                  </div>
                  <p className="mt-4 text-3xl font-bold text-white">
                    {Number.isFinite(parsedWeight) && parsedWeight >= 0
                      ? `${(parsedWeight * world.factor).toFixed(1)} kg`
                      : '--'}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">Factor gravitacional: x{world.factor}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-panel rounded-[2rem] p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-violet-300">Fase lunar</p>
            <h2 className="mt-4 text-3xl font-bold text-white">Lectura local del ciclo lunar</h2>
            <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
              <div className="moon-disc mx-auto h-28 w-28 rounded-full" />
              <p className="mt-5 text-center text-2xl font-semibold text-white">{moonPhase.name}</p>
              <p className="mt-3 text-center text-sm leading-7 text-slate-300">
                Estimacion basada en la fecha del sistema con un ciclo sinodico promedio de 29.53
                dias.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200/70">Iluminacion</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {moonPhase.illumination}% aprox.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200/70">Edad lunar</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {moonPhase.age.toFixed(1)} dias
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}

export default Home
