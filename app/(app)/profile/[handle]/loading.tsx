import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full max-w-sm" />
          <div className="flex gap-1.5 pt-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-14" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-4 w-20" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </main>
  );
}
