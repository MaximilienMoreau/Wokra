import { Skeleton } from "@/components/ui/skeleton";
import { FeedItemSkeleton } from "@/components/feed/feed-item-skeleton";

export default function SearchLoading() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      <div className="space-y-1">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-8 w-full" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-16" />
        <FeedItemSkeleton />
      </div>
    </main>
  );
}
