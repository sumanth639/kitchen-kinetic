'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { addToWishlist, removeFromWishlist } from '@/lib/firestore-utils'
import { useToast } from '@/hooks/use-toast'
import { RecipeHero } from './_components/RecipeHero'
import { RecipeIngredients } from './_components/RecipeIngredients'
import { RecipeActions } from './_components/RecipeActions'
import { RecipeInfoCard } from './_components/RecipeInfoCard'
import { Recipe, Ingredient } from '@/types/index'

export default function RecipeClient({ recipe: initialRecipe }: { recipe: Recipe }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe)
  const [servings, setServings] = useState<number>(initialRecipe.servings)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const originalIngredients = useMemo<Ingredient[]>(
    () => JSON.parse(JSON.stringify(initialRecipe.ingredients)),
    [initialRecipe.ingredients]
  )

  useEffect(() => {
    if (!user) return
    const wishlistRef = doc(db, 'users', user.uid, 'wishlist', initialRecipe.id)
    const unsub = onSnapshot(wishlistRef, (snap) => setIsInWishlist(snap.exists()))
    return () => unsub()
  }, [user, initialRecipe.id])

  useEffect(() => {
    if (!recipe || !originalIngredients.length || recipe.servings === 0) return
    const nextIngredients = originalIngredients.map((ing) => {
      if (ing.quantity === null) return ing
      const newQty = recipe.servings > 0 ? (ing.quantity * servings) / recipe.servings : ing.quantity
      return { ...ing, quantity: Math.round(newQty * 100) / 100 }
    })
    setRecipe((cur) => ({ ...cur, ingredients: nextIngredients }))
  }, [servings, originalIngredients, recipe?.servings])

  const handleServingsChange = (change: number) => {
    setServings((prev) => Math.max(1, prev + change))
  }

  const handleWishlistToggle = async () => {
    if (!user) {
      toast({ title: 'Please log in', description: 'You need to be logged in to save recipes to your wishlist.', variant: 'destructive' })
      return
    }
    if (!recipe) return
    setWishlistLoading(true)
    try {
      if (isInWishlist) {
        await removeFromWishlist(user.uid, recipe.id)
        toast({ title: 'Removed from wishlist', description: `"${recipe.title}" has been removed from your wishlist.` })
      } else {
        await addToWishlist(user.uid, recipe.id, { title: recipe.title, image_url: recipe.image_url, publisher: recipe.publisher })
        toast({ title: 'Added to wishlist!', description: `"${recipe.title}" has been added to your wishlist.` })
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setWishlistLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 pt-8 pb-6 lg:pt-12 lg:pb-8 max-w-7xl">
      <RecipeHero recipe={recipe} servings={servings} onServingsChange={handleServingsChange} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecipeIngredients ingredients={recipe.ingredients} />
        </div>
        <div className="space-y-6">
          <RecipeInfoCard recipe={recipe} servings={servings} />
          <RecipeActions recipe={recipe} isInWishlist={isInWishlist} wishlistLoading={wishlistLoading} onWishlistToggle={handleWishlistToggle} />
        </div>
      </div>
    </div>
  )
}


