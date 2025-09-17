import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import { adminDb } from '@/lib/firebase-admin';
import { getServerUser } from '@/lib/server-auth';
import { Button } from '@/components/ui/button';
import ProfileHeader from './_components/ProfileHeader';
import UserRecipeGrid from './_components/UserRecipeGrid';
import UserRecipeEmptyState from './_components/UserRecipeEmptyState';
import { UserRecipe } from '@/types/index';

export default async function ProfilePage() {
  const user = await getServerUser();
  if (!user) redirect('/login?next=%2Fprofile');
  const snap = await adminDb.collection('recipes').where('userId', '==', user.uid).get();
  const recipes = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as UserRecipe[];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-6xl mx-auto">
        <ProfileHeader user={{ uid: user.uid, email: user.email } as any} />
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
          {recipes.length > 0 ? (
            <UserRecipeGrid recipes={recipes} onDelete={() => {}} deletingRecipeId={null} />
          ) : (
            <UserRecipeEmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
