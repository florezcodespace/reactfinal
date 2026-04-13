import app from '../src/app.js'
import { connectMongo } from '../src/db/mongoose.js'

let connectionPromise

async function ensureMongoConnection() {
  if (!connectionPromise) {
    connectionPromise = connectMongo().catch((error) => {
      connectionPromise = null
      throw error
    })
  }

  await connectionPromise
}

export default async function handler(req, res) {
  await ensureMongoConnection()
  return app(req, res)
}
