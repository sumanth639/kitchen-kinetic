import { cookies } from 'next/headers'
import { adminAuth } from './firebase-admin'

const SESSION_COOKIE_NAME = 'session'

export interface ServerUser {
  uid: string
  email?: string
  name?: string
}

export async function getServerUser(): Promise<ServerUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!sessionCookie) return null
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    return { uid: decoded.uid, email: decoded.email ?? undefined, name: decoded.name ?? undefined }
  } catch {
    return null
  }
}

export { SESSION_COOKIE_NAME }


