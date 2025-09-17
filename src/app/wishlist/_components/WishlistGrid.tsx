import { WishlistItem } from '@/types/index';
import WishlistCard from './WishlistCard';

interface WishlistGridProps {
  wishlist: WishlistItem[];
}

export default function WishlistGrid({
  wishlist,
}: WishlistGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {wishlist.map((item) => (
        <WishlistCard key={item.id} recipe={item} />
      ))}
    </div>
  );
}
