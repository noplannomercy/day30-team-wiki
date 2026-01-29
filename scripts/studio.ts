import { config } from 'dotenv'
import { resolve } from 'path'
import { spawn } from 'child_process'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

console.log('🚀 Starting Drizzle Studio...')
console.log(`📍 Database URL: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}`)

// Run drizzle-kit studio with inherited environment
const studio = spawn('npx', ['drizzle-kit', 'studio'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
  }
})

studio.on('exit', (code) => {
  process.exit(code || 0)
})
