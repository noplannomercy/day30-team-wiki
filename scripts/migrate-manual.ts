import { config } from 'dotenv'
import { resolve } from 'path'
import postgres from 'postgres'
import { readFileSync } from 'fs'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set')
  process.exit(1)
}

async function main() {
  console.log('🚀 Starting manual database migration...')
  console.log(`📍 Database URL: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`)

  const client = postgres(DATABASE_URL, { max: 1 })

  try {
    // Migration files in correct order
    const migrations = [
      {
        name: '0000_flippant_doctor_octopus.sql',
        path: './drizzle/migrations/0000_flippant_doctor_octopus.sql',
      },
      {
        name: '0002_update_content_type.sql',
        path: './drizzle/migrations/0002_update_content_type.sql',
      },
      {
        name: '0001_add_search_indexes.sql',
        path: './drizzle/migrations/0001_add_search_indexes.sql',
      },
    ]

    for (const migration of migrations) {
      try {
        console.log(`📄 Running migration: ${migration.name}`)
        const sql = readFileSync(migration.path, 'utf8')

        // Split by statement breakpoint and execute each statement
        const statements = sql
          .split('--> statement-breakpoint')
          .map(s => s.trim())
          .filter(s => s && !s.startsWith('--'))

        for (const statement of statements) {
          if (statement) {
            await client.unsafe(statement)
          }
        }

        console.log(`✅ Completed: ${migration.name}\n`)
      } catch (error: any) {
        // Skip if already applied
        if (error.code === '42P07' || error.message.includes('already exists')) {
          console.log(`⏭️  Skipped (already applied): ${migration.name}\n`)
        } else if (error.code === '42701' || error.message.includes('already exists')) {
          console.log(`⏭️  Skipped (column already exists): ${migration.name}\n`)
        } else {
          throw error
        }
      }
    }

    console.log('🎉 All migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed!')
    console.error(error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
