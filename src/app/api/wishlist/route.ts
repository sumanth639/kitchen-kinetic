import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { getServerUser } from '@/lib/server-auth'
import { z } from 'zod'

const Item = z.object({ id: z.string(), title: z.string(), image_url: z.string().optional(), publisher: z.string().optional() })

export async function GET() {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const snap = await adminDb.collection('users').doc(user.uid).collection('wishlist').orderBy('addedAt', 'desc').get()
  const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
  const parsed = z.array(Item).safeParse(data)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data shape' }, { status: 500 })
  return NextResponse.json(parsed.data)
}

export async function POST(req: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await adminDb.collection('users').doc(user.uid).collection('wishlist').doc(id).delete()
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await adminDb.collection('users').doc(user.uid).collection('wishlist').doc(id).delete()
  return NextResponse.json({ ok: true })
}


