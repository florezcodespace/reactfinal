import dotenv from 'dotenv'

dotenv.config()

function parseAllowedOrigins(value) {
  return String(value || 'http://localhost:5173')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export const env = {
  port: Number(process.env.PORT || 4000),
  mongodbUri: process.env.MONGODB_URI || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  clientOrigins: parseAllowedOrigins(process.env.CLIENT_URL),
}
