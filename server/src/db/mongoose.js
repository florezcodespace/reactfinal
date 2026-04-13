import mongoose from 'mongoose'
import { env } from '../config/env.js'

export async function connectMongo() {
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is required.')
  }

  await mongoose.connect(env.mongodbUri)
}
