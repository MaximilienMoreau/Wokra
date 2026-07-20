import Link from "next/link";
import { deleteCommentAction } from "@/app/(app)/posts/interactions-actions";
import { Button } from "@/components/ui/button";

export function CommentList({
  comments,
  viewerId,
  postAuthorId,
  pathname,
}: {
  comments: {
    id: string;
    body: string;
    authorId: string;
    author: { handle: string | null; name: string | null };
  }[];
  viewerId: string;
  postAuthorId: string;
  pathname: string;
}) {
  if (comments.length === 0) {
    return <p className="text-muted-foreground text-sm">Aucun commentaire pour l&apos;instant.</p>;
  }

  return (
    <ul className="space-y-3">
      {comments.map((comment) => {
        const canDelete = comment.authorId === viewerId || postAuthorId === viewerId;
        const deleteWithArgs = deleteCommentAction.bind(null, comment.id, pathname);

        return (
          <li key={comment.id} className="text-sm">
            <div className="flex items-start justify-between gap-2">
              <p>
                {comment.author.handle ? (
                  <Link
                    href={`/profile/${comment.author.handle}`}
                    className="font-medium hover:underline"
                  >
                    {comment.author.name ?? `@${comment.author.handle}`}
                  </Link>
                ) : (
                  <span className="font-medium">{comment.author.name}</span>
                )}{" "}
                <span>{comment.body}</span>
              </p>
              {canDelete && (
                <form action={deleteWithArgs}>
                  <Button type="submit" variant="ghost" size="xs">
                    Supprimer
                  </Button>
                </form>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
