import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { z } from 'zod'

const API_KEY = process.env.NEXT_PUBLIC_FORKIFY_API_KEY
const API_URL = 'https://forkify-api.herokuapp.com/api/v2/recipes'

const RecipeItem = z.object({
  id: z.string(),
  title: z.string(),
  image_url: z.string(),
  publisher: z.string(),
  customRecipe: z.boolean(),
  createdAtMs: z.number().optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') ?? '').trim()

  const recipesRef = adminDb.collection('recipes')
  let firestoreQuery = recipesRef as FirebaseFirestore.Query
  if (q) {
    const lower = q.toLowerCase()
    firestoreQuery = recipesRef
      .where('titleLowerCase', '>=', lower)
      .where('titleLowerCase', '<=', lower + '\uf8ff')
      .limit(50)
  } else {
    firestoreQuery = recipesRef.orderBy('createdAt', 'desc').limit(50)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 4000)

  try {
    const [snap, forkify] = await Promise.all([
      firestoreQuery.get(),
      (async () => {
        try {
          const res = await fetch(
            `${API_URL}?search=${encodeURIComponent(q || 'pasta')}&key=${API_KEY}`,
            { signal: controller.signal, headers: { accept: 'application/json' } }
          )
          if (!res.ok) return [] as z.infer<typeof RecipeItem>[]
          const data = await res.json()
          return (data.data?.recipes || []).slice(0, 40).map((r: any) => ({
            id: r.id,
            title: r.title,
            image_url: r.image_url,
            publisher: r.publisher,
            customRecipe: false,
          }))
        } catch {
          return [] as z.infer<typeof RecipeItem>[]
        }
      })(),
    ])

    const firestore = snap.docs.map((d) => {
      const data = d.data() as any
      return {
        id: d.id,
        title: data.title,
        image_url: data.imageUrl || '/placeholder-recipe.jpg',
        publisher: data.publisher || 'Your Kitchen',
        customRecipe: true,
        createdAtMs: data.createdAt?.toMillis?.() ?? data.createdAt?._seconds * 1000 ?? 0,
      }
    })

    const map = new Map<string, z.infer<typeof RecipeItem>>()
    firestore.forEach((r) => map.set(r.id, r))
    forkify.forEach((r) => { if (!map.has(r.id)) map.set(r.id, r) })
    const combined = Array.from(map.values())

    const parsed = z.array(RecipeItem).safeParse(combined)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data shape' }, { status: 500 })
    }
    const res = NextResponse.json(parsed.data)
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return res
  } finally {
    clearTimeout(timeoutId)
  }
}


