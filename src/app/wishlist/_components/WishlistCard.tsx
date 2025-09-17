import Link from 'next/link';
import Image from 'next/image';
import { Heart, Soup, Trash2, BookUser, Loader2 } from 'lucide-react';
import React from 'react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { cn } from '@/lib/utils';
import { WishlistItem } from '@/types/index';

interface WishlistCardProps {
  recipe: WishlistItem;
}

export default function WishlistCard({ recipe }: WishlistCardProps) {

  return (
    <div>
      <Card className="flex flex-col overflow-hidden h-full cursor-pointer hover:shadow-lg transition-shadow">
        <Link href={`/recipes/${recipe.id}`} passHref>
          <div>
            {recipe.image_url ? (
              <div className="relative w-full h-40">
                <Image
                  src={recipe.image_url}
                  alt={recipe.title}
                  fill
                  className={'object-cover rounded-t-lg'}
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
              <p className="text-xs text-muted-foreground truncate">
                {recipe.publisher}
              </p>
            </CardHeader>
          </div>
        </Link>
        <CardFooter className="p-2 border-t mt-auto">
          <WishlistRemoveButton id={recipe.id} title={recipe.title} />
        </CardFooter>
      </Card>
    </div>
  );
}

function WishlistRemoveButton({ id, title }: { id: string; title: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="mr-2 h-4 w-4" />
          Remove
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove from wishlist?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove "{title}" from your wishlist.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <form action={`/api/wishlist?id=${encodeURIComponent(id)}`} method="POST">
              <Button type="submit" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Confirm
              </Button>
            </form>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
