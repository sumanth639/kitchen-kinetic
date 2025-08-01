import Link from 'next/link';
import { BookUser } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function UserRecipeEmptyState() {
  return (
    <div className="text-center py-10 border-dashed border-2 rounded-lg flex flex-col items-center">
      <BookUser className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">
        You haven't created any recipes yet.
      </p>
      <Button variant="link" asChild className="mt-2">
        <Link href="/recipes/new">Create one now</Link>
      </Button>
    </div>
  );
}
