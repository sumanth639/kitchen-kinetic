import { adminDb } from '@/lib/firebase-admin'
import { RecipeListItem } from './types'

const API_KEY = process.env.NEXT_PUBLIC_FORKIFY_API_KEY
const API_URL = 'https://forkify-api.herokuapp.com/api/v2/recipes'

export async function fetchRecipesServer(queryTerm: string): Promise<RecipeListItem[]> {
  const recipesRef = adminDb.collection('recipes')

  let firestoreQuery = recipesRef as FirebaseFirestore.Query
  if (queryTerm) {
    const lower = queryTerm.toLowerCase()
    firestoreQuery = recipesRef
      .where('titleLowerCase', '>=', lower)
      .where('titleLowerCase', '<=', lower + '\uf8ff')
      .limit(50)
  } else {
    firestoreQuery = recipesRef.orderBy('createdAt', 'desc').limit(50)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 4000)

  const [firestoreSnapshot, forkify] = await Promise.all([
    firestoreQuery.get(),
    (async () => {
      try {
        const res = await fetch(
          `${API_URL}?search=${encodeURIComponent(queryTerm || 'pasta')}&key=${API_KEY}`,
          { signal: controller.signal, headers: { accept: 'application/json' }, next: { revalidate: 60 } }
        )
        if (!res.ok) return [] as RecipeListItem[]
        const data = await res.json()
        return (data.data?.recipes || []).slice(0, 40).map((rec: any) => ({
          id: rec.id,
          title: rec.title,
          image_url: rec.image_url,
          publisher: rec.publisher,
          customRecipe: false,
        })) as RecipeListItem[]
      } catch {
        return [] as RecipeListItem[]
      } finally {
        clearTimeout(timeoutId)
      }
    })(),
  ])

  const firestoreRecipes: RecipeListItem[] = firestoreSnapshot.docs.map((doc) => {
    const data = doc.data() as any
    return {
      id: doc.id,
      title: data.title,
      image_url: data.imageUrl || '/placeholder-recipe.jpg',
      publisher: data.publisher || 'Your Kitchen',
      customRecipe: true,
      createdAtMs: data.createdAt?.toMillis?.() ?? data.createdAt?._seconds * 1000 ?? 0,
    }
  })

  const map = new Map<string, RecipeListItem>()
  firestoreRecipes.forEach((r) => map.set(r.id, r))
  forkify.forEach((r) => {
    if (!map.has(r.id)) map.set(r.id, r)
  })
  const finalRecipes = Array.from(map.values())
  if (!queryTerm) {
    finalRecipes.sort((a, b) => {
      const ta = a.createdAtMs ?? 0
      const tb = b.createdAtMs ?? 0
      return tb - ta
    })
  }
  return finalRecipes
}


