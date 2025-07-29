
'use client'

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';

const recipeFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid image URL.' }).optional().or(z.literal('')),
  cookingTime: z.coerce.number().min(1, { message: 'Cooking time must be at least 1 minute.' }),
  servings: z.coerce.number().min(1, { message: 'Servings must be at least 1.' }),
  ingredients: z.array(
    z.object({
      value: z.string().min(1, { message: 'Ingredient description is required.' }),
    })
  ).min(1, { message: 'At least one ingredient is required.' }),
  instructions: z.string().min(10, { message: 'Instructions must be at least 10 characters long.' }),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

export default function CreateRecipePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<RecipeFormValues>({
        resolver: zodResolver(recipeFormSchema),
        defaultValues: {
            title: '',
            imageUrl: '',
            cookingTime: 30,
            servings: 4,
            ingredients: [{ value: '' }],
            instructions: '',
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "ingredients",
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const onSubmit = async (data: RecipeFormValues) => {
        if (!user) {
            toast({
                title: 'Error',
                description: 'You must be logged in to create a recipe.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'recipes'), {
                ...data,
                userId: user.uid,
                authorEmail: user.email,
                createdAt: serverTimestamp(),
            });

            toast({
                title: 'Success!',
                description: 'Your recipe has been created.',
            });
            router.push('/profile');

        } catch (error) {
            console.error('Error creating recipe:', error);
            toast({
                title: 'Error',
                description: 'There was a problem creating your recipe. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (authLoading || !user) {
        return (
            <div className="container mx-auto px-4 py-8">
                 <Card className="w-full max-w-2xl mx-auto">
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-4">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-20 w-full" />
                           <Skeleton className="h-40 w-full" />
                       </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Create a new Recipe</CardTitle>
                    <CardDescription>Fill out the form to add your own recipe to Kitchen Kinetic.</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Recipe Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Delicious Chocolate Cake" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                             <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image URL (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com/image.jpg" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="cookingTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cooking Time (minutes)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="servings"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Servings</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div>
                                <Label>Ingredients</Label>
                                <div className="space-y-2 mt-2">
                                    {fields.map((field, index) => (
                                        <FormField
                                            key={field.id}
                                            control={form.control}
                                            name={`ingredients.${index}.value`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-2">
                                                        <FormControl>
                                                            <Input placeholder={`Ingredient ${index + 1}`} {...field} />
                                                        </FormControl>
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => append({ value: '' })}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Ingredient
                                </Button>
                            </div>

                            <FormField
                                control={form.control}
                                name="instructions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instructions</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Step 1: ..." className="min-h-[150px]" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Recipe
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    )
}
