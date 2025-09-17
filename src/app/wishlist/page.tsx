import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import WishlistGrid from './_components/WishlistGrid';
import WishlistEmptyState from './_components/WishlistEmptyState';
import WishlistLoadingSkeleton from './_components/WishlistLoadingSkeleton';
import { adminDb } from '@/lib/firebase-admin';
import { getServerUser } from '@/lib/server-auth';
import { WishlistItem } from '@/types/index';
import { Heart } from 'lucide-react';

export default async function WishlistPage() {
  const user = await getServerUser();
  if (!user) redirect('/login?next=%2Fwishlist');
  const snap = await adminDb
    .collection('users')
    .doc(user.uid)
    .collection('wishlist')
    .orderBy('addedAt', 'desc')
    .get();
  const wishlist = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as WishlistItem[];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6 border-b pb-4">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Heart className="h-8 w-8 text-primary" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground mt-1">The recipes you've saved for later.</p>
        </div>
        <div>
          <Suspense fallback={<WishlistLoadingSkeleton />}>
            {wishlist.length > 0 ? (
              <WishlistGrid wishlist={wishlist} onRemove={() => {}} removingRecipeId={null} />
            ) : (
              <WishlistEmptyState />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
