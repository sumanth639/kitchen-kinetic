import { notFound } from 'next/navigation';
import { getForkifyRecipe, getFirestoreRecipe } from './utils';
import RecipeClient from './RecipeClient';

export const revalidate = 60;

export default async function RecipeDetailsPage({ params }: { params: { id: string } }) {
  const id = params.id;
  let recipe = await getForkifyRecipe(id);
  if (!recipe) recipe = await getFirestoreRecipe(id);
  if (!recipe) return notFound();
  return <RecipeClient recipe={recipe} />;
}
