import type { Comment, CommentThread as CommentThreadNode } from "../../../shared/types";
import { cn } from "../../../shared/utils/cn";
import { CommentItem } from "./CommentItem";

/** Replies stop indenting past this depth, so a long thread stays readable. */
const MAX_INDENT_DEPTH = 2;

export interface CommentThreadProps {
  thread: CommentThreadNode;
  depth?: number;
  onReply: (comment: Comment) => void;
  className?: string;
}

/**
 * A comment and its replies.
 *
 * Recursive because the data is: a reply can itself be replied to, and the
 * thread tree from `buildCommentThreads` already has the shape.
 */
export function CommentThreadView({
  thread,
  depth = 0,
  onReply,
  className,
}: CommentThreadProps) {
  const indent = depth < MAX_INDENT_DEPTH;

  return (
    <div className={cn("flex flex-col", className)}>
      <CommentItem comment={thread.comment} depth={depth} onReply={onReply} />

      {thread.replies.length > 0 && (
        <div
          className={cn(
            "mt-3 flex flex-col gap-3",
            indent && "ms-4 border-s border-line ps-3",
          )}
        >
          {thread.replies.map((reply) => (
            <CommentThreadView
              key={reply.comment.id}
              thread={reply}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
