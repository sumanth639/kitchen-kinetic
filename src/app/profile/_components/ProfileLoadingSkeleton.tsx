
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileLoadingSkeletonProps {
  isSection?: boolean;
}

export default function ProfileLoadingSkeleton({
  isSection = false,
}: ProfileLoadingSkeletonProps) {
  if (isSection) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-row items-center gap-4 border-b pb-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
        <div className="mt-8">
           <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-36" />
           </div>
          <ProfileLoadingSkeleton isSection={true} />
        </div>
      </div>
    </div>
  );
}
