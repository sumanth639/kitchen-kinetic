import { WishlistItem } from '@/types/index';
import WishlistCard from './WishlistCard';

interface WishlistGridProps {
  wishlist: WishlistItem[];
  onRemove: (id: string) => void;
  removingRecipeId: string | null;
}

export default function WishlistGrid({
  wishlist,
  onRemove,
  removingRecipeId,
}: WishlistGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {wishlist.map((item) => (
        <WishlistCard
          key={item.id}
          recipe={item}
          onRemove={onRemove}
          isRemoving={removingRecipeId === item.id}
        />
      ))}
    </div>
  );
}
