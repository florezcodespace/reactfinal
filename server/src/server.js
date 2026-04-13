import app from './app.js'
import { env } from './config/env.js'
import { connectMongo } from './db/mongoose.js'

async function startServer() {
  try {
    await connectMongo()

    app.listen(env.port, () => {
      console.log(`Cosmos Explorer API running on http://localhost:${env.port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
