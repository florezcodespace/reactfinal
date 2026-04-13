import { fetchApi } from './api-client.js'

function buildQuery(params) {
  return new URLSearchParams(params).toString()
}

export async function getExpenses(userEmail, options = {}) {
  const query = buildQuery({ userEmail })
  return fetchApi(`/expenses?${query}`, options)
}

export async function createExpense(expense, options = {}) {
  return fetchApi('/expenses', {
    ...options,
    method: 'POST',
    body: expense,
  })
}

export async function updateExpense(expenseId, expense, options = {}) {
  return fetchApi(`/expenses/${expenseId}`, {
    ...options,
    method: 'PUT',
    body: expense,
  })
}

export async function deleteExpense(expenseId, userEmail, options = {}) {
  const query = buildQuery({ userEmail })
  return fetchApi(`/expenses/${expenseId}?${query}`, {
    ...options,
    method: 'DELETE',
  })
}
