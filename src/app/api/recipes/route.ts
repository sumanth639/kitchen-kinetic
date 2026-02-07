import { NextRequest, NextResponse } from 'next/server'
import { searchRecipesService } from '@/lib/search/search.service'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') ?? '').trim()
  const cursor = searchParams.get('cursor')

  try {
    const results = await searchRecipesService({
      query: q,
      cursor: cursor,
      limit: 50
    })

    const res = NextResponse.json(results.recipes)
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return res
  } catch (error) {
    console.error('API Recipe Search Error:', error)
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
  }
}
