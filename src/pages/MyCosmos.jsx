import { useEffect, useMemo, useState } from 'react'
import useAuth from '../context/useAuth.jsx'
import {
  createExpense as createExpenseRequest,
  deleteExpense as deleteExpenseRequest,
  getExpenses,
  updateExpense as updateExpenseRequest,
} from '../lib/expenses.js'

const expenseCategories = [
  'Equipo orbital',
  'Fotografia espacial',
  'Transporte a observatorio',
  'Mantenimiento del telescopio',
  'Cursos astronomicos',
  'Suscripciones premium',
]

const emptyForm = {
  concept: '',
  category: expenseCategories[0],
  amount: '',
  date: '',
  notes: '',
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function MyCosmos() {
  const { user } = useAuth()
  const userEmail = user?.email?.trim().toLowerCase() || ''

  const [expenses, setExpenses] = useState([])
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  useEffect(() => {
    if (!userEmail) {
      setExpenses([])
      setIsLoading(false)
      return
    }

    const controller = new AbortController()

    async function loadExpenses() {
      setIsLoading(true)
      setFeedback({ type: '', message: '' })

      try {
        const response = await getExpenses(userEmail, { signal: controller.signal })
        setExpenses(response.items || [])
      } catch (error) {
        if (error.name === 'AbortError') {
          return
        }

        setFeedback({
          type: 'error',
          message:
            'No pudimos cargar tus gastos desde el backend. Revisa que el servidor y MongoDB Atlas esten conectados.',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadExpenses()

    return () => controller.abort()
  }, [userEmail])

  const totalBudget = useMemo(
    () => expenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
    [expenses],
  )

  const latestExpense = expenses[0]

  const categoryBreakdown = useMemo(() => {
    return expenseCategories
      .map((category) => ({
        category,
        total: expenses
          .filter((expense) => expense.category === category)
          .reduce((sum, expense) => sum + Number(expense.amount), 0),
      }))
      .filter((item) => item.total > 0)
      .sort((left, right) => right.total - left.total)
  }, [expenses])

  const monthlyAverage = useMemo(() => {
    if (expenses.length === 0) {
      return 0
    }

    return totalBudget / Math.max(1, new Set(expenses.map((expense) => expense.date.slice(0, 7))).size)
  }, [expenses, totalBudget])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      concept: formData.concept.trim(),
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      notes: formData.notes.trim(),
      userEmail,
    }

    if (!payload.concept || !payload.amount || !payload.date || !payload.userEmail) {
      setFeedback({
        type: 'error',
        message: 'Completa concepto, monto, fecha e inicia sesion antes de guardar.',
      })
      return
    }

    setIsSubmitting(true)
    setFeedback({ type: '', message: '' })

    try {
      if (editingId) {
        const updatedExpense = await updateExpenseRequest(editingId, payload)
        setExpenses((current) =>
          current.map((expense) => (expense.id === editingId ? updatedExpense : expense)),
        )
        resetForm()
        setFeedback({ type: 'success', message: 'Gasto actualizado en MongoDB Atlas.' })
      } else {
        const createdExpense = await createExpenseRequest(payload)
        setExpenses((current) => [createdExpense, ...current])
        resetForm()
        setFeedback({ type: 'success', message: 'Gasto guardado correctamente en MongoDB Atlas.' })
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'No se pudo guardar el gasto. Revisa la API y la conexion a Atlas.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (expense) => {
    setEditingId(expense.id)
    setFeedback({ type: '', message: '' })
    setFormData({
      concept: expense.concept,
      category: expense.category,
      amount: String(expense.amount),
      date: expense.date,
      notes: expense.notes,
    })
  }

  const handleDelete = async (expenseId) => {
    if (!userEmail) {
      return
    }

    setFeedback({ type: '', message: '' })

    try {
      await deleteExpenseRequest(expenseId, userEmail)
      setExpenses((current) => current.filter((expense) => expense.id !== expenseId))
      setFeedback({ type: 'success', message: 'Gasto eliminado de MongoDB Atlas.' })

      if (editingId === expenseId) {
        resetForm()
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'No se pudo eliminar el gasto. Revisa la API y vuelve a intentar.',
      })
    }
  }

  const summaryCards = [
    {
      label: 'Total invertido',
      value: formatCurrency(totalBudget),
      detail: 'Acumulado de compras y movimientos guardados.',
    },
    {
      label: 'Promedio mensual',
      value: formatCurrency(monthlyAverage),
      detail: 'Ritmo estimado para tu bitacora financiera.',
    },
    {
      label: 'Ultimo registro',
      value: latestExpense?.concept || 'Sin movimientos',
      detail: latestExpense
        ? `${formatCurrency(Number(latestExpense.amount))} en ${latestExpense.category}`
        : 'Crea tu primer gasto para empezar.',
    },
  ]

  return (
    <main className="px-4 pb-12 pt-2 md:px-6 md:pb-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="glass-panel overflow-hidden rounded-[2.2rem] p-6 md:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-blue-200/75">My Cosmos</p>
              <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">
                Tu bitacora privada de equipo, salidas y compras astronomicas, {user?.name}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                Registra compras, transporte, sesiones y mantenimiento en un panel pensado para
                seguir tus gastos con mas claridad y guardarlos ahora en MongoDB Atlas.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
              {summaryCards.map((card) => (
                <article
                  key={card.label}
                  className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-violet-300">
                    {card.label}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-white">{card.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{card.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid items-stretch gap-6 xl:grid-cols-[0.98fr_1.02fr]">
          <article className="glass-panel flex h-full flex-col rounded-[2rem] p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-blue-200/75">
                  {editingId ? 'Editar movimiento' : 'Nuevo movimiento'}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  Formulario mejorado de gastos astronomicos
                </h2>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
                >
                  Cancelar
                </button>
              )}
            </div>

            <div className="mt-6 rounded-[1.7rem] border border-white/10 bg-[linear-gradient(135deg,rgba(96,165,250,0.08),rgba(124,58,237,0.14))] p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-blue-100/75">
                Vista previa del registro
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">Concepto</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formData.concept || 'Tu siguiente compra espacial'}
                  </p>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">Monto</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formData.amount ? formatCurrency(Number(formData.amount)) : '$ 0,00'}
                  </p>
                </div>
              </div>
            </div>

            {feedback.message && (
              <div
                className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
                  feedback.type === 'error'
                    ? 'border-rose-300/25 bg-rose-400/10 text-rose-100'
                    : 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100'
                }`}
              >
                {feedback.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Concepto</span>
                  <input
                    required
                    name="concept"
                    value={formData.concept}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20"
                    placeholder="Ej: ocular gran angular"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Categoria</span>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                  >
                    {expenseCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Monto</span>
                  <input
                    required
                    min="0.01"
                    step="0.01"
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20"
                    placeholder="0.00"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Fecha</span>
                  <input
                    required
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Notas</span>
                <textarea
                  rows="5"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full rounded-[1.6rem] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                  placeholder="Detalles tecnicos, motivo de compra o contexto de observacion."
                />
              </label>

              <div className="mt-auto flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#60a5fa] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting
                    ? 'Guardando...'
                    : editingId
                      ? 'Actualizar registro'
                      : 'Guardar gasto'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  Limpiar formulario
                </button>
              </div>
            </form>
          </article>

          <article className="glass-panel flex h-full flex-col rounded-[2rem] p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-blue-200/75">
                  Registro actual
                </p>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  Bitacora financiera y funciones activas
                </h2>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs uppercase tracking-[0.2em] text-blue-100">
                {expenses.length} movimientos
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Estado API</p>
                <p className="mt-2 text-sm leading-6 text-white">
                  Tus registros ahora se leen y escriben desde el backend para quedar persistidos
                  en MongoDB Atlas por usuario.
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Vista financiera</p>
                <p className="mt-2 text-sm leading-6 text-white">
                  El formulario, el resumen y el historial muestran cada movimiento con una lectura
                  mas ordenada.
                </p>
              </div>
            </div>

            {categoryBreakdown.length > 0 && (
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {categoryBreakdown.slice(0, 4).map((item) => (
                  <div
                    key={item.category}
                    className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">
                      {item.category}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex-1 space-y-4">
              {isLoading ? (
                <div className="flex min-h-[280px] items-center justify-center rounded-[1.6rem] border border-dashed border-white/15 bg-black/20 p-5 text-center text-sm text-slate-300">
                  Cargando gastos desde la API...
                </div>
              ) : expenses.length === 0 ? (
                <div className="flex min-h-[280px] items-center justify-center rounded-[1.6rem] border border-dashed border-white/15 bg-black/20 p-5 text-center text-sm text-slate-300">
                  No hay gastos cargados. Crea el primero para empezar a seguir tu inversion espacial.
                </div>
              ) : (
                expenses.map((expense) => (
                  <article
                    key={expense.id}
                    className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="max-w-2xl">
                        <p className="text-xs uppercase tracking-[0.25em] text-violet-300">
                          {expense.category}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-white">{expense.concept}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                          {expense.notes || 'Sin notas adicionales.'}
                        </p>
                      </div>

                      <div className="min-w-[190px] rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">Monto</p>
                        <p className="mt-2 text-2xl font-bold text-white">
                          {formatCurrency(Number(expense.amount))}
                        </p>
                        <p className="mt-2 text-sm text-slate-300">{expense.date}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(expense)}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(expense.id)}
                        className="rounded-full border border-rose-300/20 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-400/20"
                      >
                        Eliminar
                      </button>
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

export default MyCosmos
