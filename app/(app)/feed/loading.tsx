import { Skeleton } from "@/components/ui/skeleton";
import { FeedItemSkeleton } from "@/components/feed/feed-item-skeleton";

export default function FeedLoading() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl space-y-10 px-4 py-12">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-4 w-16" />
        <div className="space-y-6">
          <FeedItemSkeleton />
          <FeedItemSkeleton />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-6">
          <FeedItemSkeleton />
        </div>
      </div>
    </main>
  );
}
