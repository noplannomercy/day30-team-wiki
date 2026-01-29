import { config } from 'dotenv'
import { resolve } from 'path'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { sql } from 'drizzle-orm'

// Load .env.local file BEFORE any other imports
config({ path: resolve(process.cwd(), '.env.local') })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set')
  console.error('Please check your .env.local file')
  process.exit(1)
}

async function testConnection() {
  console.log('🔍 Testing database connection...')
  console.log(`📍 Database URL: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`)

  // Create postgres client
  const client = postgres(DATABASE_URL, {
    prepare: false,
    max: 1,
  })

  const db = drizzle(client)

  try {
    // Test raw SQL query
    const result = await client`SELECT version(), current_database(), current_user`
    console.log('\n✅ Database connection successful!')
    console.log('📊 Database info:')
    console.log(`  - PostgreSQL Version: ${result[0].version}`)
    console.log(`  - Database Name: ${result[0].current_database}`)
    console.log(`  - User: ${result[0].current_user}`)

    // Test Drizzle query
    const tablesResult = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    console.log('\n📋 Tables in database:')
    if (tablesResult.length === 0) {
      console.log('  ⚠️  No tables found. Run migrations with: npm run db:migrate')
    } else {
      tablesResult.forEach((row: any) => {
        console.log(`  - ${row.table_name}`)
      })
    }

    console.log('\n🎉 All tests passed!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Database connection failed!')
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`)

      // Provide helpful error messages
      if (error.message.includes('ECONNREFUSED')) {
        console.error('\n💡 Possible causes:')
        console.error('  - Database server is not running')
        console.error('  - Wrong host/port in DATABASE_URL')
        console.error('  - Firewall blocking the connection')
      } else if (error.message.includes('authentication failed')) {
        console.error('\n💡 Possible causes:')
        console.error('  - Wrong username or password')
        console.error('  - User does not have access to the database')
      } else if (error.message.includes('database') && error.message.includes('does not exist')) {
        console.error('\n💡 The database "teamwiki" does not exist.')
        console.error('   Create it first with: CREATE DATABASE teamwiki;')
      }
    }
    process.exit(1)
  } finally {
    await client.end()
  }
}

testConnection()
