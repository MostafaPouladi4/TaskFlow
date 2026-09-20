import type { ID, Nullable } from "./common";

export interface CommentReaction {
  emoji: string;
  userIds: ID[];
}

export interface Comment {
  id: ID;
  taskId: ID;
  authorId: ID;
  /** Markdown-lite: mentions are stored inline as `@[name](userId)`. */
  body: string;
  parentId: Nullable<ID>;
  createdAt: string;
  updatedAt: Nullable<string>;
  edited: boolean;
  reactions: CommentReaction[];
}

/**
 * A comment plus its resolved replies — the tree the thread renders.
 * Recursive so nesting depth isn't capped by the type.
 */
export interface CommentThread {
  comment: Comment;
  replies: CommentThread[];
}

export interface CommentDraft {
  body: string;
  parentId: Nullable<ID>;
}

/** An in-progress `@` mention: where the `@` sits and what's been typed. */
export interface MentionQuery {
  /** Index of the `@` character in the composer's value. */
  start: number;
  /** Text typed after the `@` so far — may contain spaces (Persian names). */
  query: string;
}

/** An active mention query plus the user picked from the suggestion menu. */
export interface MentionCandidate extends MentionQuery {
  user: import("./user").User;
}
