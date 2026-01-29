import { config } from 'dotenv'
import { resolve } from 'path'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'

// Load .env.local file BEFORE any other imports
config({ path: resolve(process.cwd(), '.env.local') })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set')
  process.exit(1)
}

// Import schema after env is loaded
import { workspaces, users, workspaceMembers } from '../lib/db/schema'

async function seedWorkspace() {
  const client = postgres(DATABASE_URL, { max: 1 })
  const db = drizzle(client)

  try {
    console.log('🌱 Seeding workspace...')
    console.log(`📍 Database URL: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`)

    // Check if default workspace exists
    const [existingWorkspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.name, 'Default Workspace'))
      .limit(1)

    let workspaceId: string

    if (existingWorkspace) {
      console.log('✓ Default workspace already exists:', existingWorkspace.id)
      workspaceId = existingWorkspace.id
    } else {
      // Create default workspace
      const [workspace] = await db
        .insert(workspaces)
        .values({
          name: 'Default Workspace',
          logoUrl: null,
          primaryColor: '#3B82F6',
        })
        .returning()

      workspaceId = workspace.id
      console.log('✓ Created default workspace:', workspaceId)
    }

    // Get all users who are not in any workspace
    const allUsers = await db.select().from(users)
    console.log(`\n📊 Found ${allUsers.length} users in database\n`)

    let addedCount = 0
    for (const user of allUsers) {
      const [existingMember] = await db
        .select()
        .from(workspaceMembers)
        .where(eq(workspaceMembers.userId, user.id))
        .limit(1)

      if (!existingMember) {
        await db.insert(workspaceMembers).values({
          workspaceId,
          userId: user.id,
          role: 'owner',
          isActive: true,
        })
        console.log(`✓ Added user ${user.email} to workspace as owner`)
        addedCount++
      } else {
        console.log(`⏭️  User ${user.email} already in a workspace`)
      }
    }

    console.log(`\n✅ Workspace seeding completed! (Added ${addedCount} users)`)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    await client.end()
    process.exit(1)
  } finally {
    await client.end()
    process.exit(0)
  }
}

seedWorkspace()
