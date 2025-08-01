import Link from 'next/link';
import Image from 'next/image';
import { Trash2, BookUser, Loader2 } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/alert-dialog';
import { UserRecipe } from '@/types/index';

interface UserRecipeCardProps {
  recipe: UserRecipe;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export default function UserRecipeCard({
  recipe,
  onDelete,
  isDeleting,
}: UserRecipeCardProps) {
  return (
    <div>
      <Card className="flex flex-col overflow-hidden h-full cursor-pointer hover:shadow-lg transition-shadow">
        <Link href={`/recipes/${recipe.id}`} passHref>
          <div>
            {recipe.imageUrl ? (
              <div className="relative w-full h-40">
                <Image
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  fill
                  className="object-cover rounded-t-lg"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  data-ai-hint="recipe food"
                />
              </div>
            ) : (
              <div className="h-40 bg-secondary flex items-center justify-center rounded-t-lg">
                <BookUser className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
            <CardHeader className="flex-grow p-4">
              <CardTitle className="text-lg capitalize leading-tight">
                {recipe.title}
              </CardTitle>
            </CardHeader>
          </div>
        </Link>
        <CardFooter className="p-2 border-t mt-auto">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your recipe "{recipe.title}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(recipe.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
