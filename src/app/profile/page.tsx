
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import {
  subscribeToUserRecipes,
  deleteUserRecipe,
} from '@/lib/firestore-utils';
import { Button } from '@/components/ui/button';

import ProfileHeader from './_components/ProfileHeader';
import UserRecipeGrid from './_components/UserRecipeGrid';
import UserRecipeEmptyState from './_components/UserRecipeEmptyState';
import ProfileLoadingSkeleton from './_components/ProfileLoadingSkeleton';
import { UserRecipe } from '@/types/index';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [recipes, setRecipes] = useState<UserRecipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [deletingRecipeId, setDeletingRecipeId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Subscribe to user's recipes
  useEffect(() => {
    if (!user) return;

    setRecipesLoading(true);
    const unsubscribe = subscribeToUserRecipes(
      user.uid,
      (userRecipes) => {
        setRecipes(userRecipes as UserRecipe[]); // Cast to UserRecipe[]
        setRecipesLoading(false);
      },
      (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        setRecipesLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, toast]);

  const handleDeleteRecipe = async (recipeId: string) => {
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
      await deleteUserRecipe(user.uid, recipeId);
      toast({
        title: 'Recipe deleted',
        description: 'Your recipe has been successfully deleted.',
      });
    } catch (error: any) {
      console.error('Error deleting recipe:', error);
      toast({
        title: 'Error',
        description:
          error.message ||
          'There was a problem deleting your recipe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingRecipeId(null);
    }
  };

  // Show a full-page skeleton while authentication is loading
  if (authLoading || !user) {
    return <ProfileLoadingSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-6xl mx-auto">
        <ProfileHeader user={user} />
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold">My Recipes</h2>
            <Button asChild>
              <Link href="/recipes/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Recipe
              </Link>
            </Button>
          </div>
          {recipesLoading ? (
            <ProfileLoadingSkeleton isSection={true} />
          ) : recipes.length > 0 ? (
            <UserRecipeGrid
              recipes={recipes}
              onDelete={handleDeleteRecipe}
              deletingRecipeId={deletingRecipeId}
            />
          ) : (
            <UserRecipeEmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
