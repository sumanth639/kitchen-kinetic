// app/profile/page.tsx (or wherever your ProfilePage component is)

'use client';

import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link'; // Import Link
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  CollectionReference,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, BookUser, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserRecipe {
  id: string;
  title: string;
  imageUrl?: string;
  // Add other properties if needed for display on the detail page
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<UserRecipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [deletingRecipeId, setDeletingRecipeId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    setRecipesLoading(true);
    // Ensure "userId" matches the field in your Firestore recipes collection
    const q = query(
      collection(db, 'recipes') as CollectionReference<UserRecipe>,
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const userRecipes = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setRecipes(userRecipes);
        setRecipesLoading(false);
      },
      (error) => {
        console.error('Error fetching user recipes: ', error);
        toast({
          title: 'Error',
          description: 'Could not fetch your recipes.',
          variant: 'destructive',
        });
        setRecipesLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, toast]);

  const handleDelete = async (recipeId: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to delete recipes.',
        variant: 'destructive',
      });
      return;
    }

    setDeletingRecipeId(recipeId);
    
    try {
      // First, verify the recipe belongs to the current user
      const recipeRef = doc(db, 'recipes', recipeId);
      
      await deleteDoc(recipeRef);
      
      toast({
        title: 'Recipe deleted',
        description: 'Your recipe has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: 'Error',
        description:
          'There was a problem deleting your recipe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingRecipeId(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-6xl mx-auto">
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback>
              {user.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <CardTitle className="text-2xl">
              {user.displayName || 'User'}'s Dashboard
            </CardTitle>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">My Recipes</h2>
            <Button asChild>
              <Link href="/recipes/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Recipe
              </Link>
            </Button>
          </div>
          {recipesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                // Wrap the entire Card with Link
               <div key={recipe.id}>
                <Card className="flex flex-col overflow-hidden h-full cursor-pointer hover:shadow-lg transition-shadow">
                     <Link href={`/recipes/${recipe.id}`}  passHref>
                   <div>
                    {/* Added h-full and cursor-pointer for better UX */}
                    {recipe.imageUrl ? (
                      <div className="relative w-full h-40">
                        <Image
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          fill
                          className="object-cover rounded-t-lg"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          data-ai-hint="recipe food"
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-secondary flex items-center justify-center rounded-t-lg">
                        <BookUser className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                    <CardHeader className="flex-grow p-4">
                      <CardTitle className="text-lg capitalize leading-tight">
                        {recipe.title}
                      </CardTitle>
                    </CardHeader>
                    </div>
                    </Link>
                    <CardFooter className="p-2 border-t mt-auto">
                      <AlertDialog>
                      <AlertDialogTrigger asChild>
  <Button
    variant="ghost"
    size="sm"
    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
    disabled={deletingRecipeId === recipe.id}
  >
    {deletingRecipeId === recipe.id ? (
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    ) : (
      <Trash2 className="mr-2 h-4 w-4" />
    )}
    {deletingRecipeId === recipe.id ? 'Deleting...' : 'Delete'}
  </Button>
                      </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your recipe "{recipe.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(recipe.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={deletingRecipeId === recipe.id}
                            >
                              {deletingRecipeId === recipe.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                'Delete'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                </div>
                  
                
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border-dashed border-2 rounded-lg flex flex-col items-center">
              <BookUser className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                You haven't created any recipes yet.
              </p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/recipes/new">Create one now</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
