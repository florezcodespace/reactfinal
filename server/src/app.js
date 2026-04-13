import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import expenseRoutes from './routes/expenseRoutes.js'
import healthRoutes from './routes/healthRoutes.js'

const app = express()

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('Not allowed by CORS'))
    },
  }),
)
app.use(express.json())

app.use('/api/health', healthRoutes)
app.use('/api/expenses', expenseRoutes)

export default app
