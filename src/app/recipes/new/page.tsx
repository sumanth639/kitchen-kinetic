// src/app/recipes/new/page.tsx
'use client';

import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, PlusCircle, Trash2, UploadCloud } from 'lucide-react'; // Added UploadCloud icon

// --- Cloudinary setup ---
// Make sure these are in your .env.local
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const CLOUDINARY_UPLOAD_PRESET = 'kitchen-kinetic';

const recipeFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long.' }),

  imageUrl: z
    .string()
    .url({ message: 'A valid image URL is required after upload.' })
    .optional()
    .or(z.literal('')),
  cookingTime: z.coerce
    .number()
    .min(1, { message: 'Cooking time must be at least 1 minute.' }),
  servings: z.coerce
    .number()
    .min(1, { message: 'Servings must be at least 1.' }),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1, { message: 'Ingredient name is required.' }),
        quantity: z.coerce
          .number()
          .positive({ message: 'Quantity must be a positive number.' }),
        unit: z.string().min(1, { message: 'Unit is required.' }),
      })
    )
    .min(1, { message: 'At least one ingredient is required.' }),
  instructions: z
    .string()
    .min(10, { message: 'Instructions must be at least 10 characters long.' }),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

export default function CreateRecipePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null); // State to hold the selected image file
  const [uploadingImage, setUploadingImage] = useState(false); // State for image upload status

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: '',
      imageUrl: '', // This will be populated after image upload
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
      // Optional: Display a preview of the image
      // const reader = new FileReader();
      // reader.onload = (e) => form.setValue('imageUrl', e.target?.result as string);
      // reader.readAsDataURL(event.target.files[0]);
    } else {
      setImageFile(null);
      form.setValue('imageUrl', ''); // Clear the image URL if no file is selected
    }
  };

  const uploadImageToCloudinary = async (): Promise<string | null> => {
    if (!imageFile) {
      console.log('No image file selected.');
      return null;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); // <-- **THIS IS THE FIX!**
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME || '');

    console.log('Attempting Cloudinary upload...');
    console.log('Cloud Name:', CLOUDINARY_CLOUD_NAME);
    console.log('Upload Preset:', CLOUDINARY_UPLOAD_PRESET); // <-- Also update this log to show the correct value
    console.log('Image File:', imageFile);
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary API response error:', errorText);
        throw new Error(
          `Cloudinary upload failed: ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      toast({
        title: 'Image Uploaded!',
        description: 'Your recipe image has been successfully uploaded.',
      });
      return data.secure_url; // The URL of the uploaded image
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      toast({
        title: 'Image Upload Error',
        description: `Failed to upload image: ${
          error instanceof Error ? error.message : String(error)
        }`,
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploadingImage(false);
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
    let uploadedImageUrl: string | null = ''; // Initialize with empty string

    // Only attempt to upload if an image file is selected
    if (imageFile) {
      uploadedImageUrl = await uploadImageToCloudinary();
      if (!uploadedImageUrl) {
        setIsSubmitting(false); // Stop submission if image upload fails
        return;
      }
    }

    try {
      await addDoc(collection(db, 'recipes'), {
        ...data,
        imageUrl: uploadedImageUrl, // Use the uploaded URL
        userId: user.uid,
        authorEmail: user.email,
        createdAt: serverTimestamp(),
        // --- ADDED THIS LINE ---
        titleLowerCase: data.title.toLowerCase(), // Add the lowercase title for searching
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
    );
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

              {/* Image Upload Field */}
              <FormItem>
                <FormLabel>Recipe Image (Upload)</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-grow"
                      disabled={uploadingImage || isSubmitting}
                    />
                    {(uploadingImage || isSubmitting) && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </FormControl>
                {imageFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {imageFile.name}
                  </p>
                )}
                {/* Display an error if imageUrl is required but missing after submission attempt */}
                {form.formState.errors.imageUrl && (
                  <FormMessage>
                    {form.formState.errors.imageUrl.message}
                  </FormMessage>
                )}
              </FormItem>

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
                    <div key={field.id} className="flex items-start gap-2">
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-grow">
                            <FormControl>
                              <Input
                                placeholder={`Ingredient ${index + 1}`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Qty"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.unit`}
                        render={({ field }) => (
                          <FormItem className="w-32">
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="g">g</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="ml">ml</SelectItem>
                                <SelectItem value="l">l</SelectItem>
                                <SelectItem value="tsp">tsp</SelectItem>
                                <SelectItem value="tbsp">tbsp</SelectItem>
                                <SelectItem value="cup">cup</SelectItem>
                                <SelectItem value="pinch">pinch</SelectItem>
                                <SelectItem value="piece">piece</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => append({ name: '', quantity: 1, unit: 'cup' })}
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
                {uploadingImage ? 'Uploading Image...' : 'Create Recipe'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
