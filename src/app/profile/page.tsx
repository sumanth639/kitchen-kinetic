
'use client'

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface UserRecipe {
    id: string;
    title: string;
    // Add other recipe fields you might want to display on the card
}

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [recipes, setRecipes] = useState<UserRecipe[]>([]);
    const [recipesLoading, setRecipesLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);
    
    useEffect(() => {
        async function fetchUserRecipes() {
            if (!user) return;
            setRecipesLoading(true);
            try {
                const q = query(collection(db, "recipes"), where("userId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const userRecipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserRecipe));
                setRecipes(userRecipes);
            } catch (error) {
                console.error("Error fetching user recipes: ", error);
            } finally {
                setRecipesLoading(false);
            }
        }

        if (user) {
            fetchUserRecipes();
        }
    }, [user]);

    if (loading || !user) {
        return (
            <div className="container mx-auto px-4 py-8">
                 <Card className="w-full max-w-4xl mx-auto">
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
        )
    }


    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">{user.displayName || 'User'}'s Dashboard</CardTitle>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">My Recipes</h2>
                        <Button asChild>
                            <Link href="/recipes/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create New Recipe
                            </Link>
                        </Button>
                    </div>
                    {recipesLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                        </div>
                    ) : recipes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recipes.map(recipe => (
                                <Card key={recipe.id}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{recipe.title}</CardTitle>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border-dashed border-2 rounded-lg">
                            <p className="text-muted-foreground">You haven't created any recipes yet.</p>
                            <Button variant="link" asChild className="mt-2">
                                <Link href="/recipes/new">Create one now</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
