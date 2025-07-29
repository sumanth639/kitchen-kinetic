
'use client'

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot, doc, deleteDoc, CollectionReference } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, BookUser } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"

interface UserRecipe {
    id: string;
    title: string;
    imageUrl?: string;
}

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [recipes, setRecipes] = useState<UserRecipe[]>([]);
    const [recipesLoading, setRecipesLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);
    
    useEffect(() => {
        if (!user) return;
        
        setRecipesLoading(true);
        const q = query(collection(db, "recipes") as CollectionReference<UserRecipe>, where("userId", "==", user.uid));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userRecipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRecipes(userRecipes);
            setRecipesLoading(false);
        }, (error) => {
            console.error("Error fetching user recipes: ", error);
            toast({ title: "Error", description: "Could not fetch your recipes.", variant: "destructive" });
            setRecipesLoading(false);
        });

        return () => unsubscribe();
    }, [user, toast]);

    const handleDelete = async (recipeId: string) => {
        try {
            await deleteDoc(doc(db, "recipes", recipeId));
            toast({
                title: "Recipe deleted",
                description: "Your recipe has been successfully deleted.",
            })
        } catch (error) {
            console.error("Error deleting recipe:", error);
            toast({
                title: "Error",
                description: "There was a problem deleting your recipe. Please try again.",
                variant: "destructive",
            });
        }
    }

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
                            {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                        </div>
                    ) : recipes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recipes.map(recipe => (
                                <Card key={recipe.id} className="flex flex-col">
                                    {recipe.imageUrl && (
                                         <div className="relative w-full h-32">
                                            <Image src={recipe.imageUrl} alt={recipe.title} layout="fill" objectFit="cover" className="rounded-t-lg" data-ai-hint="recipe food" />
                                         </div>
                                    )}
                                    <CardHeader className="flex-grow">
                                        <CardTitle className="text-lg">{recipe.title}</CardTitle>
                                    </CardHeader>
                                    <CardFooter className="p-2 border-t">
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete your recipe.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(recipe.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                    Delete
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border-dashed border-2 rounded-lg flex flex-col items-center">
                            <BookUser className="h-12 w-12 text-muted-foreground mb-4" />
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
