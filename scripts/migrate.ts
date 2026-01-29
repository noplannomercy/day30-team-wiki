import { config } from 'dotenv'
import { resolve } from 'path'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set')
  process.exit(1)
}

async function main() {
  console.log('🚀 Starting database migration...')
  console.log(`📍 Database URL: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`)

  const client = postgres(DATABASE_URL, { max: 1 })
  const db = drizzle(client)

  try {
    await migrate(db, { migrationsFolder: './drizzle/migrations' })
    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed!')
    console.error(error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
