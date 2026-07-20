import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPostWithDetails } from "@/lib/data/posts";
import { PostCard } from "@/components/posts/post-card";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const post = await getPostWithDetails(id, session.user.id);
  if (!post || !post.author.handle) {
    notFound();
  }

  return (
    <main id="main-content" className="mx-auto max-w-2xl space-y-4 px-4 py-12">
      <Link href={`/profile/${post.author.handle}`} className="flex items-center gap-2 text-sm">
        {post.author.image ? (
          <Image src={post.author.image} alt="" width={24} height={24} className="rounded-full" />
        ) : (
          <span className="bg-muted size-6 rounded-full" />
        )}
        <span className="font-medium">{post.author.name ?? `@${post.author.handle}`}</span>
        <span className="text-muted-foreground">@{post.author.handle}</span>
      </Link>
      <PostCard
        post={post}
        viewerId={session.user.id}
        pathname={`/posts/${id}`}
        isOwner={post.authorId === session.user.id}
      />
    </main>
  );
}
