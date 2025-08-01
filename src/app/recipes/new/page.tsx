'use client';

import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

import { recipeFormSchema, RecipeFormValues } from '@/types/recipe';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { ImageUploadField } from './_components/ImageUploadField';
import { IngredientsField } from './_components/IngredientsField';
import { RecipeFormSkeleton } from './_components/RecipeFormSkeleton';

export default function CreateRecipePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: '',
      imageUrl: '',
      cookingTime: 30,
      servings: 4,
      ingredients: [{ name: '', quantity: 1, unit: 'cup' }],
      instructions: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ingredients',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    } else {
      setImageFile(null);
      form.setValue('imageUrl', '');
    }
  };

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
    let uploadedImageUrl: string | null = '';

    if (imageFile) {
      uploadedImageUrl = await uploadImageToCloudinary(
        imageFile,
        setUploadingImage,
        toast
      );
      if (!uploadedImageUrl) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await addDoc(collection(db, 'recipes'), {
        ...data,
        imageUrl: uploadedImageUrl,
        userId: user.uid,
        authorEmail: user.email,
        createdAt: serverTimestamp(),
        titleLowerCase: data.title.toLowerCase(),
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
        description:
          'There was a problem creating your recipe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return <RecipeFormSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create a new Recipe</CardTitle>
          <CardDescription>
            Upload an image and fill out the form to add your own recipe to
            Kitchen Kinetic.
          </CardDescription>
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
                      <Input
                        placeholder="e.g., Delicious Chocolate Cake"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ImageUploadField
                imageFile={imageFile}
                uploadingImage={uploadingImage}
                isSubmitting={isSubmitting}
                onImageChange={handleImageChange}
                error={form.formState.errors.imageUrl?.message}
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

              <IngredientsField
                form={form}
                fields={fields}
                append={append}
                remove={remove}
              />

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Step 1: ..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting || uploadingImage}>
                {(isSubmitting || uploadingImage) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {uploadingImage ? 'Creating  Recipe...' : 'Create Recipe'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
