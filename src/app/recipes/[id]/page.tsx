'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/auth-provider';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { addToWishlist, removeFromWishlist } from '@/lib/firestore-utils';
import { useToast } from '@/hooks/use-toast';
import { RecipeHero } from './_components/RecipeHero';
import { RecipeIngredients } from './_components/RecipeIngredients';
import { RecipeActions } from './_components/RecipeActions';
import { RecipeInfoCard } from './_components/RecipeInfoCard';
import  RecipeSkeleton  from './_components/RecipeSkeleton';
import { getForkifyRecipe, getFirestoreRecipe } from './utils';
import { Recipe, Ingredient } from '@/types/index';

export default function RecipeDetailsPage() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(0);
  const [originalIngredients, setOriginalIngredients] = useState<Ingredient[]>(
    []
  );
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const id = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    async function loadRecipe() {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);

      let fetchedRecipe: Recipe | null = null;

      fetchedRecipe = await getForkifyRecipe(id);

      if (!fetchedRecipe) {
        fetchedRecipe = await getFirestoreRecipe(id);
      }

      if (!fetchedRecipe) {
        notFound();
      } else {
        setRecipe(fetchedRecipe);
        setServings(fetchedRecipe.servings);
        setOriginalIngredients(
          JSON.parse(JSON.stringify(fetchedRecipe.ingredients))
        );
      }
      setLoading(false);
    }
    loadRecipe();
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;

    const wishlistRef = doc(db, 'users', user.uid, 'wishlist', id);
    const unsubscribe = onSnapshot(wishlistRef, (docSnap) => {
      setIsInWishlist(docSnap.exists());
    });

    return () => unsubscribe();
  }, [id, user]);

  useEffect(() => {
    if (!recipe || !originalIngredients.length || recipe.servings === 0) return;

    if (
      servings === recipe.servings &&
      recipe.ingredients.length === originalIngredients.length
    ) {
      return;
    }

    const newIngredients = originalIngredients.map((ing) => {
      if (ing.quantity === null) {
        return ing;
      }
      const newQuantity =
        recipe.servings > 0
          ? (ing.quantity * servings) / recipe.servings
          : ing.quantity;
      return { ...ing, quantity: Math.round(newQuantity * 100) / 100 };
    });

    setRecipe((currentRecipe) => {
      if (!currentRecipe) return null;
      return {
        ...currentRecipe,
        ingredients: newIngredients,
      };
    });
  }, [servings, originalIngredients, recipe?.servings]);

  const handleServingsChange = (change: number) => {
    setServings((prev) => Math.max(1, prev + change));
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast({
        title: 'Please log in',
        description:
          'You need to be logged in to save recipes to your wishlist.',
        variant: 'destructive',
      });
      return;
    }
    if (!recipe) return;

    setWishlistLoading(true);

    try {
      if (isInWishlist) {
        await removeFromWishlist(user.uid, recipe.id);
        toast({
          title: 'Removed from wishlist',
          description: `"${recipe.title}" has been removed from your wishlist.`,
        });
      } else {
        await addToWishlist(user.uid, recipe.id, {
          title: recipe.title,
          image_url: recipe.image_url,
          publisher: recipe.publisher,
        });
        toast({
          title: 'Added to wishlist!',
          description: `"${recipe.title}" has been added to your wishlist.`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return <RecipeSkeleton />;
  }

  if (!recipe) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 pt-8 pb-6 lg:pt-12 lg:pb-8 max-w-7xl">
      <RecipeHero
        recipe={recipe}
        servings={servings}
        onServingsChange={handleServingsChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecipeIngredients ingredients={recipe.ingredients} />
        </div>

        <div className="space-y-6">
        <RecipeInfoCard recipe={recipe} servings={servings} />
        
          <RecipeActions
            recipe={recipe}
            isInWishlist={isInWishlist}
            wishlistLoading={wishlistLoading}
            onWishlistToggle={handleWishlistToggle}
          />

         
        </div>
      </div>
    </div>
  );
}
