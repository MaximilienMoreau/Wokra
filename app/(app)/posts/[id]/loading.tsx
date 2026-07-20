import { FeedItemSkeleton } from "@/components/feed/feed-item-skeleton";

export default function PostDetailLoading() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl space-y-4 px-4 py-12">
      <FeedItemSkeleton />
    </main>
  );
}
