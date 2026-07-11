import { Skeleton } from "@/components/ui/skeleton";

export default function ConversationLoading() {
  return (
    <main id="main-content" className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12">
      <div className="space-y-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="space-y-3">
        <div className="flex justify-start">
          <Skeleton className="h-10 w-2/5 rounded-lg" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-1/3 rounded-lg" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-14 w-1/2 rounded-lg" />
        </div>
      </div>

      <Skeleton className="h-16 w-full" />
    </main>
  );
}
