import { getServerSession } from 'next-auth/next'
import { authOptions } from './config'

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function requireAuth() {
  const session = await getSession()

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  return session.user
}
