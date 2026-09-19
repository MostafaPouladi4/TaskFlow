import type { Comment, CommentThread } from "../types";

/**
 * Assembles a comment list into a reply tree.
 *
 * Orphans (a reply whose parent was deleted) are promoted to the root rather
 * than dropped, so no message ever silently disappears from a thread.
 */
export function buildCommentThreads(comments: Comment[]): CommentThread[] {
  const nodes = new Map<string, CommentThread>();

  for (const comment of comments) {
    nodes.set(comment.id, { comment, replies: [] });
  }

  const roots: CommentThread[] = [];

  for (const comment of comments) {
    const node = nodes.get(comment.id);
    if (!node) continue;

    const parent = comment.parentId ? nodes.get(comment.parentId) : undefined;

    if (parent && parent !== node) {
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  const byOldestFirst = (a: CommentThread, b: CommentThread): number =>
    a.comment.createdAt.localeCompare(b.comment.createdAt);

  const sortDeep = (threads: CommentThread[]): CommentThread[] =>
    threads.sort(byOldestFirst).map((thread) => ({
      comment: thread.comment,
      replies: sortDeep(thread.replies),
    }));

  return sortDeep(roots);
}

/** Total messages in a thread, including nested replies. */
export function countThreadMessages(threads: CommentThread[]): number {
  return threads.reduce(
    (total, thread) => total + 1 + countThreadMessages(thread.replies),
    0,
  );
}

/** The ids a delete would remove: the comment itself plus its direct replies. */
export function collectCascadeIds(
  comments: Comment[],
  commentId: string,
): string[] {
  return [
    commentId,
    ...comments
      .filter((comment) => comment.parentId === commentId)
      .map((comment) => comment.id),
  ];
}
