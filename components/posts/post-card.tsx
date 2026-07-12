import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import type { ArtifactType } from "@prisma/client";
import { ArtifactCard } from "@/components/profile/artifact-card";
import { Button } from "@/components/ui/button";
import { getCommentsForPost } from "@/lib/data/comments";
import { toggleLikeAction } from "@/app/(app)/posts/interactions-actions";
import { deletePostAction } from "@/app/(app)/posts/actions";
import { CommentList } from "@/components/posts/comment-list";
import { CommentForm } from "@/components/posts/comment-form";

export async function PostCard({
  post,
  viewerId,
  pathname,
  isOwner,
}: {
  post: {
    id: string;
    body: string;
    imageUrl: string | null;
    linkUrl: string | null;
    linkTitle: string | null;
    linkDescription: string | null;
    linkImageUrl: string | null;
    authorId: string;
    sharedArtifact: {
      id: string;
      type: ArtifactType;
      title: string;
      description: string;
      url: string;
      stack: string[];
      verified: boolean;
      verificationToken: string | null;
    } | null;
    _count: { likes: number; comments: number };
    likes: { userId: string }[];
  };
  viewerId: string;
  pathname: string;
  isOwner: boolean;
}) {
  const liked = post.likes.length > 0;
  const comments = await getCommentsForPost(post.id);
  const toggleLikeWithArgs = toggleLikeAction.bind(null, post.id, pathname);
  const deleteWithId = deletePostAction.bind(null, post.id);

  return (
    <article className="space-y-3 rounded-lg border p-5">
      <p className="text-sm whitespace-pre-wrap">{post.body}</p>

      {post.imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border">
          <Image src={post.imageUrl} alt="" fill className="object-cover" />
        </div>
      )}

      {post.linkUrl && !post.sharedArtifact && (
        <a
          href={post.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:bg-muted/50 block overflow-hidden rounded-md border"
        >
          {post.linkImageUrl && (
            // Arbitrary external host from a user-supplied link — not eligible for next/image
            // optimization without a wildcard remotePattern.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.linkImageUrl} alt="" className="h-40 w-full object-cover" />
          )}
          <div className="space-y-1 p-3">
            <p className="text-sm font-medium">{post.linkTitle ?? post.linkUrl}</p>
            {post.linkDescription && (
              <p className="text-muted-foreground line-clamp-2 text-xs">{post.linkDescription}</p>
            )}
          </div>
        </a>
      )}

      {post.sharedArtifact && (
        <ArtifactCard artifact={post.sharedArtifact} isOwner={false} hideShare />
      )}

      <div className="flex items-center gap-4 pt-1">
        <form action={toggleLikeWithArgs}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            aria-label={liked ? "Ne plus aimer" : "Aimer"}
          >
            <Heart className={liked ? "fill-current" : undefined} />
            {post._count.likes}
          </Button>
        </form>
        <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
          <MessageCircle className="size-4" />
          {post._count.comments}
        </span>
        {isOwner && (
          <form action={deleteWithId} className="ml-auto">
            <Button type="submit" variant="ghost" size="sm">
              Supprimer
            </Button>
          </form>
        )}
      </div>

      <details className="space-y-3">
        <summary className="text-muted-foreground cursor-pointer text-sm select-none">
          {comments.length > 0 ? `Voir les commentaires (${comments.length})` : "Commenter"}
        </summary>
        <div className="space-y-3 pt-2">
          <CommentList
            comments={comments}
            viewerId={viewerId}
            postAuthorId={post.authorId}
            pathname={pathname}
          />
          <CommentForm postId={post.id} pathname={pathname} />
        </div>
      </details>
    </article>
  );
}
