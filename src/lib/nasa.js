import heroImage from '../assets/hero.png'
import roverNavImage from '../assets/fallbacks/rover-nav.svg'
import roverPanoramaImage from '../assets/fallbacks/rover-panorama.svg'
import roverSurfaceImage from '../assets/fallbacks/rover-surface.svg'
import { HttpRequestError, fetchJson } from './http.js'

const API_BASE_URL = 'https://api.nasa.gov'
const DEMO_API_KEY = 'DEMO_KEY'
const TODAY = new Date()

export const FALLBACK_APOD = {
  title: 'Nebulosa de respaldo para navegacion offline',
  date: 'Fallback local',
  media_type: 'image',
  explanation:
    'Si la API de la NASA no responde, la interfaz mantiene una experiencia estable con contenido local y una imagen de respaldo integrada en la aplicacion.',
  copyright: 'Cosmos Explorer',
  url: heroImage,
}

const FALLBACK_ROVER_PHOTOS = [
  {
    id: 'fallback-rover-1',
    image: roverPanoramaImage,
    camera: 'Camara panoramica simulada',
    earthDate: 'Fallback local',
    rover: 'Curiosity',
    sol: '---',
  },
  {
    id: 'fallback-rover-2',
    image: roverNavImage,
    camera: 'Modulo de navegacion',
    earthDate: 'Fallback local',
    rover: 'Curiosity',
    sol: '---',
  },
  {
    id: 'fallback-rover-3',
    image: roverSurfaceImage,
    camera: 'Sensor de superficie',
    earthDate: 'Fallback local',
    rover: 'Curiosity',
    sol: '---',
  },
]

const FALLBACK_ASTEROIDS = [
  {
    id: 'neo-fallback-1',
    name: 'Objeto cercano de referencia',
    approachDate: formatDateInput(TODAY),
    hazardous: false,
    missDistanceKm: 850000,
    velocityKph: 42000,
    diameterMeters: 120,
    nasaUrl: 'https://api.nasa.gov/',
  },
  {
    id: 'neo-fallback-2',
    name: 'Asteroide de muestra',
    approachDate: formatDateInput(addDays(TODAY, 1)),
    hazardous: true,
    missDistanceKm: 1200000,
    velocityKph: 51000,
    diameterMeters: 210,
    nasaUrl: 'https://api.nasa.gov/',
  },
]

const FALLBACK_SOLAR_FLARES = [
  {
    id: 'flare-fallback-1',
    classType: 'M1.0',
    beginTime: `${formatDateInput(TODAY)}T05:30:00Z`,
    peakTime: `${formatDateInput(TODAY)}T05:44:00Z`,
    sourceLocation: 'N12W04',
    linkedEvents: 1,
  },
]

function getApiKey() {
  return import.meta.env.VITE_NASA_API_KEY?.trim()
}

function getApiKeys() {
  const configuredKey = getApiKey()

  if (!configuredKey) {
    return [DEMO_API_KEY]
  }

  return configuredKey === DEMO_API_KEY ? [DEMO_API_KEY] : [configuredKey, DEMO_API_KEY]
}

function buildApiUrl(path, params = {}) {
  const url = new URL(path, API_BASE_URL)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })

  return url.toString()
}

async function requestJson(path, params, { signal } = {}) {
  const apiKeys = getApiKeys()

  for (const apiKey of apiKeys) {
    try {
      return await fetchJson(buildApiUrl(path, { ...params, api_key: apiKey }), {
        signal,
        timeoutMs: 15000,
      })
    } catch (error) {
      if (!(error instanceof HttpRequestError)) {
        throw error
      }

      if (apiKey !== DEMO_API_KEY && (error.status === 403 || error.status === 429)) {
        continue
      }

      if (error.status >= 500) {
        throw new Error('nasa_server_error')
      }

      if (error.status === 403 || error.status === 429) {
        throw new Error(apiKey === DEMO_API_KEY ? 'nasa_rate_limited' : 'nasa_key_rejected')
      }

      if (error.status === 404) {
        throw new Error('nasa_not_found')
      }

      if (error.code === 'network_error') {
        throw new Error('network_error')
      }

      throw new Error('nasa_request_error')
    }
  }

  throw new Error(getApiKey() ? 'nasa_request_error' : 'missing_key')
}

function normalizeApodPayload(data) {
  const supportedMedia = data?.media_type === 'image' || data?.media_type === 'video'

  if (!supportedMedia || !data?.url) {
    return FALLBACK_APOD
  }

  return data
}

function normalizeRoverPhotos(data) {
  const photos = data?.latest_photos ?? data?.photos ?? []

  return photos.slice(0, 9).map((photo) => ({
    id: String(photo.id),
    image: photo.img_src?.replace('http://', 'https://'),
    camera: photo.camera?.full_name || photo.camera?.name || 'Camara NASA',
    earthDate: photo.earth_date,
    rover: photo.rover?.name || 'Rover',
    sol: photo.sol,
  }))
}

function normalizeNeoFeed(data) {
  const groupedObjects = Object.values(data?.near_earth_objects ?? {})
  const flattenedObjects = groupedObjects.flat()

  return flattenedObjects
    .map((object) => {
      const closeApproach = object.close_approach_data?.[0]
      const missDistanceKm = Number(closeApproach?.miss_distance?.kilometers ?? 0)
      const velocityKph = Number(closeApproach?.relative_velocity?.kilometers_per_hour ?? 0)
      const minDiameter = Number(object.estimated_diameter?.meters?.estimated_diameter_min ?? 0)
      const maxDiameter = Number(object.estimated_diameter?.meters?.estimated_diameter_max ?? 0)

      return {
        id: object.id,
        name: object.name,
        approachDate: closeApproach?.close_approach_date || 'Sin fecha',
        hazardous: Boolean(object.is_potentially_hazardous_asteroid),
        missDistanceKm,
        velocityKph,
        diameterMeters: Math.round((minDiameter + maxDiameter) / 2),
        nasaUrl: object.nasa_jpl_url,
      }
    })
    .sort((left, right) => left.missDistanceKm - right.missDistanceKm)
    .slice(0, 6)
}

function normalizeSolarFlares(data) {
  return [...(data ?? [])]
    .sort((left, right) => new Date(right.beginTime) - new Date(left.beginTime))
    .slice(0, 9)
    .map((flare) => ({
      id: flare.flrID,
      classType: flare.classType || 'Sin clase',
      beginTime: flare.beginTime,
      peakTime: flare.peakTime,
      sourceLocation: flare.sourceLocation || 'Desconocida',
      linkedEvents: flare.linkedEvents?.length ?? 0,
    }))
}

export function addDays(date, amount) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + amount)
  return nextDate
}

export function formatDateInput(date) {
  return new Date(date).toISOString().slice(0, 10)
}

export function getRandomApodDate() {
  const minDate = new Date('1995-06-16T00:00:00Z').getTime()
  const maxDate = Date.now()
  const randomTime = minDate + Math.random() * (maxDate - minDate)
  return formatDateInput(randomTime)
}

export async function fetchApod({ signal, date } = {}) {
  try {
    const payload = normalizeApodPayload(
      await requestJson('/planetary/apod', { date }, { signal }),
    )

    return {
      data: payload,
      sourceLabel: 'NASA APOD',
      reason: 'success',
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    return {
      data: FALLBACK_APOD,
      sourceLabel:
        error.message === 'missing_key'
          ? 'Fallback por API key vacia'
          : 'Fallback por error de NASA',
      reason: error.message || 'unknown_error',
    }
  }
}

export async function fetchLatestRoverPhotos({ signal, rover = 'curiosity' } = {}) {
  try {
    const payload = await requestJson(
      `/mars-photos/api/v1/rovers/${rover}/latest_photos`,
      {},
      { signal },
    )

    const items = normalizeRoverPhotos(payload)

    return {
      items: items.length > 0 ? items : FALLBACK_ROVER_PHOTOS,
      reason: 'success',
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    return {
      items: FALLBACK_ROVER_PHOTOS,
      reason: error.message || 'unknown_error',
    }
  }
}

export async function fetchNeoFeed({ signal, startDate, endDate } = {}) {
  try {
    const payload = await requestJson(
      '/neo/rest/v1/feed',
      { start_date: startDate, end_date: endDate },
      { signal },
    )

    return {
      items: normalizeNeoFeed(payload),
      reason: 'success',
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    return {
      items: FALLBACK_ASTEROIDS,
      reason: error.message || 'unknown_error',
    }
  }
}

export async function fetchSolarFlares({ signal, startDate, endDate } = {}) {
  try {
    const payload = await requestJson(
      '/DONKI/FLR',
      { startDate, endDate },
      { signal },
    )

    return {
      items: normalizeSolarFlares(payload),
      reason: 'success',
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    return {
      items: FALLBACK_SOLAR_FLARES,
      reason: error.message || 'unknown_error',
    }
  }
}
