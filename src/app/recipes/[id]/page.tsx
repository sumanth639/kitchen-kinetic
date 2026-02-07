import { notFound } from 'next/navigation';
import { getForkifyRecipe, getFirestoreRecipe } from './utils';
import RecipeClient from './RecipeClient';

export const revalidate = 60;

export default async function RecipeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let recipe = await getForkifyRecipe(id);
  if (!recipe) recipe = await getFirestoreRecipe(id);
  if (!recipe) return notFound();
  return <RecipeClient recipe={recipe} />;
}
