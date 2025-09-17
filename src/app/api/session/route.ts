import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { SESSION_COOKIE_NAME } from '@/lib/server-auth'

export async function POST(req: NextRequest) {
  const { idToken } = await req.json()
  if (!idToken) return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })

  const expiresIn = 14 * 24 * 60 * 60 * 1000 // 14 days
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })

  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: expiresIn / 1000,
  })
  return res
}


