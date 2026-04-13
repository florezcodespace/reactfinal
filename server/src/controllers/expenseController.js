import Expense from '../models/Expense.js'

function normalizePayload(input = {}) {
  return {
    concept: String(input.concept || '').trim(),
    category: String(input.category || '').trim(),
    amount: Number(input.amount),
    date: String(input.date || '').trim(),
    notes: String(input.notes || '').trim(),
    userEmail: String(input.userEmail || '')
      .trim()
      .toLowerCase(),
  }
}

function validateExpense(payload) {
  if (!payload.userEmail) {
    return 'userEmail is required.'
  }

  if (!payload.concept) {
    return 'concept is required.'
  }

  if (!payload.category) {
    return 'category is required.'
  }

  if (!payload.date) {
    return 'date is required.'
  }

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    return 'amount must be greater than 0.'
  }

  return null
}

export async function listExpenses(req, res) {
  const { userEmail } = req.query

  if (!userEmail) {
    return res.status(400).json({ message: 'userEmail is required.' })
  }

  const expenses = await Expense.find({ userEmail }).sort({ date: -1, createdAt: -1 })

  return res.json({ items: expenses.map((expense) => expense.toJSON()) })
}

export async function createExpense(req, res) {
  const payload = normalizePayload(req.body)
  const validationError = validateExpense(payload)

  if (validationError) {
    return res.status(400).json({ message: validationError })
  }

  const expense = await Expense.create(payload)
  return res.status(201).json(expense.toJSON())
}

export async function updateExpense(req, res) {
  const payload = normalizePayload(req.body)
  const validationError = validateExpense(payload)

  if (validationError) {
    return res.status(400).json({ message: validationError })
  }

  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userEmail: payload.userEmail },
    payload,
    {
      new: true,
      runValidators: true,
    },
  )

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found.' })
  }

  return res.json(expense.toJSON())
}

export async function deleteExpense(req, res) {
  const userEmail = String(req.query.userEmail || '')
    .trim()
    .toLowerCase()

  if (!userEmail) {
    return res.status(400).json({ message: 'userEmail is required.' })
  }

  const expense = await Expense.findOneAndDelete({
    _id: req.params.id,
    userEmail,
  })

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found.' })
  }

  return res.status(204).send()
}
