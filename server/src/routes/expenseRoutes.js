import { Router } from 'express'
import {
  createExpense,
  deleteExpense,
  listExpenses,
  updateExpense,
} from '../controllers/expenseController.js'

const router = Router()

router.get('/', listExpenses)
router.post('/', createExpense)
router.put('/:id', updateExpense)
router.delete('/:id', deleteExpense)

export default router
