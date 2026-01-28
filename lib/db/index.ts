import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Disable prepared statements for Neon serverless
export const client = postgres(connectionString, {
  prepare: false,
  max: 10, // Connection pool size
})

export const db = drizzle(client, { schema })
