import { useEffect, useMemo, useState } from 'react'
import astronomyTerms from '../data/astronomyTerms.json'
import blackHoleImage from '../assets/terms/black-hole.svg'
import pulsarImage from '../assets/terms/pulsar.svg'
import supernovaImage from '../assets/terms/supernova.svg'
import useAuth from '../context/useAuth.jsx'
import { fetchJson, isAbortError } from '../lib/http.js'

const DEFAULT_QUERY = 'galaxy'
const FAVORITES_STORAGE_PREFIX = 'cosmos-favorites'
const TERM_IMAGES = {
  supernova: supernovaImage,
  blackHole: blackHoleImage,
  pulsar: pulsarImage,
}

function SearchSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-3 backdrop-blur-xl"
        >
          <div className="h-56 animate-pulse rounded-[1.25rem] bg-white/10" />
          <div className="mt-4 h-5 w-2/3 animate-pulse rounded-full bg-white/10" />
          <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-white/10" />
        </div>
      ))}
    </div>
  )
}

function readStoredFavorites(storageKey) {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedFavorites = window.localStorage.getItem(storageKey)
    return storedFavorites ? JSON.parse(storedFavorites) : []
  } catch {
    return []
  }
}

function Explore() {
  const { user } = useAuth()
  const [query, setQuery] = useState(DEFAULT_QUERY)
  const [searchTerm, setSearchTerm] = useState(DEFAULT_QUERY)
  const [dictionaryQuery, setDictionaryQuery] = useState('')
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedTerm, setSelectedTerm] = useState(astronomyTerms[0])

  const favoritesStorageKey = `${FAVORITES_STORAGE_PREFIX}:${user?.email ?? 'guest'}`
  const [favorites, setFavorites] = useState(() => readStoredFavorites(favoritesStorageKey))

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(favoritesStorageKey, JSON.stringify(favorites))
  }, [favorites, favoritesStorageKey])

  useEffect(() => {
    const controller = new AbortController()

    async function searchImages() {
      try {
        setStatus('loading')
        setError('')

        const data = await fetchJson(
          `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`,
          { signal: controller.signal, timeoutMs: 15000 },
        )
        const collection = data?.collection?.items ?? []
        setItems(collection)
        setStatus('success')
      } catch (fetchError) {
        if (isAbortError(fetchError)) {
          return
        }

        setStatus('error')
        setError('No fue posible cargar la galeria de NASA en este momento.')
      }
    }

    searchImages()

    return () => controller.abort()
  }, [query])

  const filteredTerms = useMemo(() => {
    const normalizedQuery = dictionaryQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return astronomyTerms
    }

    return astronomyTerms.filter((term) => {
      const searchableText =
        `${term.term} ${term.category} ${term.summary} ${term.description}`.toLowerCase()
      return searchableText.includes(normalizedQuery)
    })
  }, [dictionaryQuery])

  const favoriteIds = useMemo(() => new Set(favorites.map((favorite) => favorite.id)), [favorites])
  const dictionaryHighlights = [
    {
      label: 'Conceptos base',
      value: `${astronomyTerms.length}`,
      detail: 'Terminos esenciales para orientarte entre fenomenos, objetos y procesos del cosmos.',
    },
    {
      label: 'Categoria actual',
      value: selectedTerm.category,
      detail: 'Cada ficha prioriza contexto, definicion clara y utilidad real al leer noticias o misiones.',
    },
    {
      label: 'Modo de estudio',
      value: dictionaryQuery ? 'Busqueda activa' : 'Lectura guiada',
      detail: 'Puedes recorrer el glosario completo o entrar por una palabra puntual.',
    },
  ]

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextQuery = searchTerm.trim()

    if (!nextQuery) {
      return
    }

    setQuery(nextQuery)
  }

  const saveFavorite = (favorite) => {
    if (!user) {
      return
    }

    setFavorites((currentFavorites) => {
      if (currentFavorites.some((item) => item.id === favorite.id)) {
        return currentFavorites
      }

      return [favorite, ...currentFavorites]
    })
  }

  const removeFavorite = (favoriteId) => {
    setFavorites((currentFavorites) => currentFavorites.filter((item) => item.id !== favoriteId))
  }

  return (
    <main className="px-4 pb-12 pt-4 md:px-6 md:pb-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="glass-panel overflow-hidden rounded-[2.2rem] p-6 md:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="flex h-full flex-col justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-blue-200/80">
                  Diccionario astronomico
                </p>
                <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">
                  Conceptos clave para leer el cielo con mas contexto.
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                  Recorre un glosario visual de terminos esenciales, consulta una ficha ampliada y
                  relaciona cada concepto con imagenes y categorias faciles de reconocer.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {dictionaryHighlights.map((item) => (
                  <article
                    key={item.label}
                    className="rounded-[1.55rem] border border-white/10 bg-black/20 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.22em] text-blue-200/70">
                      {item.label}
                    </p>
                    <p className="mt-3 text-2xl font-bold text-white">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                  </article>
                ))}
              </div>
            </div>

            <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-2xl md:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.35em] text-violet-300">
                    Busqueda conceptual
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-white">
                    Encuentra terminos por nombre, categoria o descripcion
                  </h2>
                </div>

                <label className="w-full max-w-md">
                  <span className="sr-only">Buscar termino</span>
                  <input
                    type="text"
                    value={dictionaryQuery}
                    onChange={(event) => setDictionaryQuery(event.target.value)}
                    placeholder="Busca: supernova, exoplaneta, nebulosa..."
                    className="w-full rounded-full border border-white/10 bg-black/20 px-5 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20"
                  />
                </label>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {filteredTerms.map((term) => (
                  <button
                    key={term.id}
                    type="button"
                    onClick={() => setSelectedTerm(term)}
                    className={`rounded-[1.6rem] border p-5 text-left transition ${
                      selectedTerm.id === term.id
                        ? 'border-blue-400/40 bg-blue-400/10'
                        : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.25em] text-violet-300">
                      {term.category}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">{term.term}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{term.summary}</p>
                  </button>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="grid items-stretch gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-2xl md:p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-violet-300">Ficha destacada</p>
            <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-white/10">
              <img
                src={TERM_IMAGES[selectedTerm.imageKey]}
                alt={selectedTerm.term}
                loading="lazy"
                decoding="async"
                className="h-72 w-full object-cover"
              />
            </div>

            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-blue-200/70">
                  {selectedTerm.category}
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{selectedTerm.term}</h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  saveFavorite({
                    id: `term:${selectedTerm.id}`,
                    title: selectedTerm.term,
                    description: selectedTerm.summary,
                    image: TERM_IMAGES[selectedTerm.imageKey],
                    type: 'Termino',
                  })
                }
                disabled={!user || favoriteIds.has(`term:${selectedTerm.id}`)}
                className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {favoriteIds.has(`term:${selectedTerm.id}`) ? 'Guardado' : 'Guardar'}
              </button>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">{selectedTerm.description}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">Resumen</p>
                <p className="mt-2 text-sm leading-6 text-white">{selectedTerm.summary}</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">Aplicacion</p>
                <p className="mt-2 text-sm leading-6 text-white">
                  Te ayuda a interpretar noticias, imagenes NASA y fenomenos del observatorio.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
              {user
                ? `Tus favoritos se guardan localmente para ${user.email}.`
                : 'Inicia sesion para guardar este termino en Mis Descubrimientos.'}
            </div>
          </aside>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-2xl md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-blue-200/80">
                  Mis Descubrimientos
                </p>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  Favoritos guardados en tu exploracion
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-300">
                Conserva terminos o imagenes de NASA para volver a ellos despues y construir tu
                propia coleccion de referencias.
              </p>
            </div>

            {!user ? (
              <div className="mt-6 rounded-[1.6rem] border border-dashed border-white/15 bg-black/20 p-5 text-sm text-slate-300">
                Inicia sesion para activar una coleccion personalizada de favoritos.
              </div>
            ) : favorites.length === 0 ? (
              <div className="mt-6 rounded-[1.6rem] border border-dashed border-white/15 bg-black/20 p-5 text-sm text-slate-300">
                Aun no has guardado descubrimientos. Prueba con una ficha del diccionario o una
                imagen de la NASA.
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {favorites.map((favorite) => (
                  <article
                    key={favorite.id}
                    className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/20"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={favorite.image}
                        alt={favorite.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-xs uppercase tracking-[0.25em] text-violet-300">
                        {favorite.type}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{favorite.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{favorite.description}</p>
                      <button
                        type="button"
                        onClick={() => removeFavorite(favorite.id)}
                        className="mt-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
                      >
                        Quitar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.35em] text-blue-200/80">Explore NASA</p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">
                Galeria interactiva de planetas, galaxias y misiones.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
                Busca imagenes en el catalogo de NASA, abre cada recurso y consulta sus metadatos
                clave sin salir de la experiencia principal.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex w-full max-w-xl gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Busca: mars, nebula, jupiter..."
                className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/20 px-5 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20"
              />
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-violet-600 to-blue-400 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
              >
                Buscar
              </button>
            </form>
          </div>
        </section>

        {status === 'loading' && <SearchSkeleton />}

        {status === 'error' && (
          <section className="rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-6 text-sm text-rose-200 backdrop-blur-xl">
            {error}
          </section>
        )}

        {status === 'success' && (
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.slice(0, 12).map((item) => {
              const metadata = item.data?.[0]
              const preview = item.links?.[0]?.href
              const key = metadata?.nasa_id || item.href
              const favoriteKey = `nasa:${metadata?.nasa_id || key}`

              return (
                <article
                  key={key}
                  className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 text-left shadow-glow backdrop-blur-xl transition hover:-translate-y-1 hover:border-blue-400/30"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="block w-full text-left"
                  >
                    <div className="relative h-64 overflow-hidden">
                      {preview ? (
                        <img
                          src={preview}
                          alt={metadata?.title || 'NASA media'}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-white/5 text-sm text-slate-400">
                          Sin preview
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                    </div>

                    <div className="p-5">
                      <p className="text-xs uppercase tracking-[0.25em] text-blue-200/70">
                        {metadata?.center || 'NASA'}
                      </p>
                      <h2 className="line-clamp-2 mt-2 text-xl font-semibold text-white">
                        {metadata?.title || 'Sin titulo'}
                      </h2>
                      <p className="line-clamp-3 mt-3 text-sm leading-6 text-slate-300">
                        {metadata?.description || 'Sin descripcion disponible.'}
                      </p>
                    </div>
                  </button>

                  <div className="px-5 pb-5">
                    <button
                      type="button"
                      onClick={() =>
                        saveFavorite({
                          id: favoriteKey,
                          title: metadata?.title || 'Recurso NASA',
                          description: metadata?.description || 'Sin descripcion disponible.',
                          image: preview,
                          type: 'Imagen NASA',
                        })
                      }
                      disabled={!user || favoriteIds.has(favoriteKey) || !preview}
                      className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {favoriteIds.has(favoriteKey) ? 'Guardado' : 'Guardar en favoritos'}
                    </button>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm md:items-center">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-[2rem] border border-white/10 bg-[#0b1020]/95 p-4 shadow-glow md:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-violet-300">
                  Detalles NASA
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {selectedItem.data?.[0]?.title || 'Recurso seleccionado'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
              >
                Cerrar
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
                <img
                  src={selectedItem.links?.[0]?.href}
                  alt={selectedItem.data?.[0]?.title || 'NASA preview'}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-blue-200/70">Fecha</p>
                  <p className="mt-2 text-sm text-white">
                    {selectedItem.data?.[0]?.date_created || 'Sin fecha'}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-blue-200/70">Centro</p>
                  <p className="mt-2 text-sm text-white">
                    {selectedItem.data?.[0]?.center || 'NASA'}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-blue-200/70">
                    Descripcion
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {selectedItem.data?.[0]?.description || 'Sin descripcion disponible.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    saveFavorite({
                      id: `nasa:${selectedItem.data?.[0]?.nasa_id || selectedItem.href}`,
                      title: selectedItem.data?.[0]?.title || 'Recurso NASA',
                      description:
                        selectedItem.data?.[0]?.description || 'Sin descripcion disponible.',
                      image: selectedItem.links?.[0]?.href,
                      type: 'Imagen NASA',
                    })
                  }
                  disabled={
                    !user ||
                    favoriteIds.has(`nasa:${selectedItem.data?.[0]?.nasa_id || selectedItem.href}`) ||
                    !selectedItem.links?.[0]?.href
                  }
                  className="rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {favoriteIds.has(`nasa:${selectedItem.data?.[0]?.nasa_id || selectedItem.href}`)
                    ? 'Ya esta en favoritos'
                    : 'Guardar en Mis Descubrimientos'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Explore
