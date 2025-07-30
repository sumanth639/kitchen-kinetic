import * as z from 'zod';

export const recipeFormSchema = z.object({
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

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  uploadPreset: string;
} 