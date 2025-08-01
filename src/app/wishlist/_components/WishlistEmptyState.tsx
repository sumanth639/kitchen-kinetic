import Link from 'next/link';
import { Soup } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function WishlistEmptyState() {
  return (
    <div className="text-center py-10 border-dashed border-2 rounded-lg flex flex-col items-center">
      <Soup className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground text-lg">Your wishlist is empty.</p>
      <p className="text-muted-foreground text-sm">
        Save recipes you like to see them here.
      </p>
      <Button variant="default" asChild className="mt-4">
        <Link href="/">Find Recipes</Link>
      </Button>
    </div>
  );
}
