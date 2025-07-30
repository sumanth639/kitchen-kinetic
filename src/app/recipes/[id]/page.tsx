'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { type Recipe, type Ingredient } from '@/types'; // Ensure your Recipe type is comprehensive
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Users,
  ChefHat,
  ExternalLink,
  CheckCircle2,
  Minus,
  Plus,
  Heart,
} from 'lucide-react';
// import { Separator } from '@/components/ui/separator'; // Separator is not used in the provided code
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { addToWishlist, removeFromWishlist } from '@/lib/firestore-utils';
import { useToast } from '@/hooks/use-toast';

const API_KEY = process.env.NEXT_PUBLIC_FORKIFY_API_KEY;
const API_URL = 'https://forkify-api.herokuapp.com/api/v2/recipes';

// Existing function to fetch recipe from Forkify API
async function getForkifyRecipe(id: string): Promise<Recipe | null> {
  try {
    const res = await fetch(`${API_URL}/${id}?key=${API_KEY}`);
    if (!res.ok) {
      // It's crucial to return null if not found or error, so we can try Firestore
      console.warn(
        `Forkify API did not find recipe with ID: ${id} or encountered an error.`
      );
      return null;
    }
    const data = await res.json();
    // Map Forkify data to your Recipe type
    // Make sure your Recipe type aligns with both Forkify and Firestore structures
    return {
      id: data.data.recipe.id,
      title: data.data.recipe.title,
      image_url: data.data.recipe.image_url,
      publisher: data.data.recipe.publisher,
      cooking_time: data.data.recipe.cooking_time,
      servings: data.data.recipe.servings,
      source_url: data.data.recipe.source_url,
      ingredients: data.data.recipe.ingredients.map((ing: any) => ({
        quantity: ing.quantity,
        unit: ing.unit,
        description: ing.description,
      })),
      customRecipe: false, // Mark as not a custom recipe
    };
  } catch (error) {
    console.error('Failed to fetch recipe from Forkify API:', error);
    return null;
  }
}

// New function to fetch recipe from Firestore
async function getFirestoreRecipe(id: string): Promise<Recipe | null> {
  try {
    const recipeDocRef = doc(db, 'recipes', id); // Assuming your user recipes are in a 'recipes' collection
    const docSnap = await getDoc(recipeDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Map Firestore data to your Recipe type
      // Ensure these fields exist in your Firestore documents
      return {
        id: docSnap.id,
        title: data.title,
        image_url: data.imageUrl || '/placeholder-recipe.jpg', // Provide a fallback image
        publisher: data.publisher || 'Your Kitchen', // Default publisher for custom recipes
        cooking_time: data.cookingTime || 30, // Default if not stored in Firestore
        servings: data.servings || 4, // Default if not stored in Firestore
        source_url: data.sourceUrl || '#', // Custom recipes might not have an external source URL
        ingredients: data.ingredients || [], // Assuming ingredients are stored as an array of {quantity, unit, description}
        customRecipe: true, // Mark as a custom recipe
        userId: data.userId, // Include userId if useful (e.g., for showing "Created by You")
      };
    } else {
      console.log(`No Firestore recipe found with ID: ${id}`);
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch recipe from Firestore:', error);
    return null;
  }
}

function RecipeImage({ src, alt }: { src: string; alt: string }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full max-w-2xl mx-auto h-64 sm:h-72 lg:h-80">
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: 'cover' }}
        className={cn(
          'transition-opacity duration-300 rounded-lg',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
        onLoad={() => setIsLoading(false)}
        data-ai-hint="recipe food"
        priority
      />
      {isLoading && <Skeleton className="absolute inset-0 rounded-lg" />}
    </div>
  );
}

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

      // First, try to fetch from Forkify API
      fetchedRecipe = await getForkifyRecipe(id);

      // If not found in Forkify, try fetching from Firestore
      if (!fetchedRecipe) {
        fetchedRecipe = await getFirestoreRecipe(id);
      }

      if (!fetchedRecipe) {
        notFound(); // If recipe is not found in either source
      } else {
        setRecipe(fetchedRecipe);
        setServings(fetchedRecipe.servings);
        // Deep copy ingredients to preserve original state for serving adjustments
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

    // Listen to wishlist changes for the current recipe ID
    // This will work for both Forkify and custom recipe IDs
    const wishlistRef = doc(db, 'users', user.uid, 'wishlist', id);
    const unsubscribe = onSnapshot(wishlistRef, (docSnap) => {
      setIsInWishlist(docSnap.exists());
    });

    return () => unsubscribe();
  }, [id, user]);

  useEffect(() => {
    if (!recipe || !originalIngredients.length || recipe.servings === 0) return; // Add check for recipe.servings to prevent division by zero

    // Only recalculate ingredients if servings change or if ingredients are somehow out of sync
    if (
      servings === recipe.servings &&
      recipe.ingredients.length === originalIngredients.length
    ) {
      // This check is to prevent infinite loops if `recipe.ingredients` is being updated by this effect
      // and causing a re-render even when logic dictates it shouldn't.
      // A more robust solution might involve memoizing originalIngredients.
      return;
    }

    const newIngredients = originalIngredients.map((ing) => {
      if (ing.quantity === null) {
        return ing;
      }
      // Ensure recipe.servings is not zero before division
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servings, originalIngredients, recipe?.servings]); // Add recipe.servings to dependency array

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
        // For custom recipes, you might want to store more data in the wishlist
        // For now, we'll use the same structure for simplicity
        await addToWishlist(user.uid, recipe.id, {
          title: recipe.title,
          image_url: recipe.image_url,
          publisher: recipe.publisher,
          customRecipe: recipe.customRecipe || false, // Store if it's a custom recipe
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
    return (
      <div className="container mx-auto px-4 pt-8 pb-6 lg:pt-12 lg:pb-8 max-w-7xl">
        {/* Hero Section Skeleton */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="w-full h-64 sm:h-72 lg:h-80 rounded-lg mb-6" />
          </div>
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <Skeleton className="h-10 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <div className="flex justify-center gap-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-5 w-5 rounded-full mt-1 shrink-0" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return null; // Should ideally be handled by notFound(), but a safety net
  }

  return (
    <div className="container mx-auto px-4 pt-8 pb-6 lg:pt-12 lg:pb-8 max-w-7xl">
      {/* Hero Section */}
      <div className="mb-8 lg:mb-12">
        <RecipeImage src={recipe.image_url} alt={recipe.title} />

        <div className="max-w-4xl mx-auto text-center mt-6 lg:mt-8">
          <CardTitle className="text-3xl capitalize sm:text-4xl lg:text-5xl font-bold text-primary leading-tight mb-4">
            {recipe.title}
          </CardTitle>
          <CardDescription className="flex items-center justify-center gap-2 text-lg mb-6">
            <ChefHat className="h-6 w-6 text-muted-foreground" />
            <span>By {recipe.publisher}</span>
            {recipe?.customRecipe && (
              <span className="text-sm text-muted-foreground/80">
                (Your Recipe)
              </span>
            )}{' '}
            {/* Indicate custom recipe */}
          </CardDescription>

          {/* Recipe Stats */}
          <div className="flex flex-wrap justify-center gap-6 lg:gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6" />
              <span className="text-lg">{recipe.cooking_time} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              <span className="text-lg">Serves {servings}</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:text-primary"
                onClick={() => handleServingsChange(-1)}
                disabled={servings <= 1}
              >
                <Minus className="h-5 w-5" />
              </Button>
              <span className="font-bold text-primary text-lg w-6 text-center">
                {servings}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:text-primary"
                onClick={() => handleServingsChange(1)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Ingredients */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl lg:text-3xl">
                Ingredients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {recipe.ingredients.map((ing, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-1 shrink-0" />
                    <span className="text-base leading-relaxed">
                      {ing.quantity ? `${ing.quantity} ` : ''}
                      {ing.unit && `${ing.unit} `}
                      {ing.description}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full text-lg h-14"
                  disabled={recipe.source_url === '#'}
                >
                  <a
                    href={recipe.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {/* Wrap text and icon in a single span */}
                    <span>
                      View Full Recipe
                      <ExternalLink className="ml-2 h-6 w-6" />
                    </span>
                  </a>
                </Button>

                <Button
                  size="lg"
                  variant={isInWishlist ? 'secondary' : 'outline'}
                  className="w-full text-lg h-14"
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                >
                  <Heart
                    className={cn(
                      'mr-2 h-6 w-6',
                      isInWishlist && 'fill-destructive text-destructive'
                    )}
                  />
                  {isInWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recipe Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Recipe Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Prep + Cook Time</span>
                <span className="font-medium">{recipe.cooking_time} min</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Servings</span>
                <span className="font-medium">{recipe.servings} people</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Publisher</span>
                <span className="font-medium text-right">
                  {recipe.publisher}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
