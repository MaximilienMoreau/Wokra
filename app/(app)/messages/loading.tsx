import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <Skeleton className="h-7 w-32" />
      <div className="divide-y rounded-lg border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
