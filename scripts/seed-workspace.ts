import 'dotenv/config'
import { db } from '../lib/db'
import { workspaces, users, workspaceMembers } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

async function seedWorkspace() {
  try {
    console.log('🌱 Seeding workspace...')

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
      }
    }

    console.log('✅ Workspace seeding completed!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

seedWorkspace()
