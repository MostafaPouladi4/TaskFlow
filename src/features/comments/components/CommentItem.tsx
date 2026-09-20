import { useState } from "react";
import { CornerDownRight, Pencil, SmilePlus, Trash2 } from "lucide-react";
import { ACTION_LABELS, COMMENT_LABELS, GENERIC_LABELS } from "../../../shared/constants/labels";
import { CURRENT_USER_ID } from "../../../shared/constants/config";
import { useWorkspace } from "../../../shared/hooks/useWorkspace";
import type { Comment } from "../../../shared/types";
import { cn } from "../../../shared/utils/cn";
import { formatRelativeTime } from "../../../shared/utils/date";
import { Avatar } from "../../../shared/components/ui/Avatar";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { CommentComposer } from "./CommentComposer";
import { MentionText } from "./MentionText";

const QUICK_REACTIONS = ["👍", "❤️", "🎉", "👀", "✅"];

export interface CommentItemProps {
  comment: Comment;
  /** Nesting level — replies are indented, capped visually at two steps. */
  depth?: number;
  /** Called with the comment being replied to. */
  onReply?: (comment: Comment) => void;
}

/**
 * One comment, with its actions.
 *
 * Edit happens inline rather than in a dialog, and delete always asks first —
 * removing a comment takes its replies with it, so it is not a casual action.
 */
export function CommentItem({ comment, depth = 0, onReply }: CommentItemProps) {
  const { index, actions } = useWorkspace();

  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reactionsOpen, setReactionsOpen] = useState(false);

  const author = index.users.get(comment.authorId);
  const isOwn = comment.authorId === CURRENT_USER_ID;

  const visibleReactions = comment.reactions.filter(
    (reaction) => reaction.userIds.length > 0,
  );

  const handleUpdate = async (body: string): Promise<boolean> => {
    const ok = await actions.updateComment(comment.id, body);
    if (ok) setEditing(false);
    return ok;
  };

  return (
    <article
      className={cn("group/comment flex gap-2.5", depth > 0 && "mt-1")}
    >
      <Avatar
        name={author?.name ?? GENERIC_LABELS.unknownUser}
        initials={author?.avatar ?? GENERIC_LABELS.unknownInitial}
        seed={comment.authorId}
        size="sm"
        className="mt-0.5"
      />

      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-[12px] font-semibold text-content">
            {author?.name ?? GENERIC_LABELS.unknownUser}
          </span>

          {isOwn && (
            <span className="rounded bg-surface-3 px-1 text-[10px] text-muted">
              {GENERIC_LABELS.you}
            </span>
          )}

          <time
            dateTime={comment.createdAt}
            className="text-[10px] text-subtle"
          >
            {formatRelativeTime(comment.createdAt)}
          </time>

          {comment.edited && (
            <span className="text-[10px] text-subtle">
              · {COMMENT_LABELS.edited}
            </span>
          )}

          {!editing && (
            <span
              className={cn(
                "ms-auto flex items-center gap-0.5 transition-opacity",
                // Stay visible while the picker is open, otherwise moving the
                // pointer onto it would hide the very thing being clicked.
                reactionsOpen
                  ? "opacity-100"
                  : "opacity-0 group-hover/comment:opacity-100 focus-within:opacity-100",
              )}
            >
              <span className="relative">
                <IconButton
                  icon={SmilePlus}
                  label={COMMENT_LABELS.emoji}
                  size="sm"
                  variant="ghost"
                  aria-expanded={reactionsOpen}
                  onClick={() => setReactionsOpen((open) => !open)}
                />

                {reactionsOpen && (
                  <span className="absolute inset-e-0 top-full z-40 mt-1 flex animate-scale-in gap-0.5 rounded-xl border border-line bg-surface p-1 shadow-lg">
                    {QUICK_REACTIONS.map((emoji) => {
                      const mine =
                        comment.reactions
                          .find((reaction) => reaction.emoji === emoji)
                          ?.userIds.includes(CURRENT_USER_ID) ?? false;

                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            actions.toggleReaction(comment.id, emoji);
                            setReactionsOpen(false);
                          }}
                          aria-label={COMMENT_LABELS.react(emoji)}
                          aria-pressed={mine}
                          className={cn(
                            "inline-flex size-7 items-center justify-center rounded-lg text-base transition-colors hover:bg-surface-2",
                            mine && "bg-brand-500/10",
                          )}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </span>
                )}
              </span>

              {onReply && (
                <IconButton
                  icon={CornerDownRight}
                  label={COMMENT_LABELS.reply}
                  size="sm"
                  variant="ghost"
                  onClick={() => onReply(comment)}
                />
              )}

              {isOwn && (
                <>
                  <IconButton
                    icon={Pencil}
                    label={COMMENT_LABELS.edit}
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(true)}
                  />
                  <IconButton
                    icon={Trash2}
                    label={COMMENT_LABELS.delete}
                    size="sm"
                    variant="danger"
                    onClick={() => setConfirmOpen(true)}
                  />
                </>
              )}
            </span>
          )}
        </header>

        {editing ? (
          <CommentComposer
            className="mt-2"
            initialValue={comment.body}
            submitLabel={ACTION_LABELS.save}
            autoFocus
            onCancel={() => setEditing(false)}
            onSubmit={handleUpdate}
          />
        ) : (
          <MentionText body={comment.body} className="mt-1" />
        )}

        {visibleReactions.length > 0 && (
          <ul className="mt-1.5 flex flex-wrap gap-1">
            {visibleReactions.map((reaction) => {
              const mine = reaction.userIds.includes(CURRENT_USER_ID);

              return (
                <li key={reaction.emoji}>
                  <button
                    type="button"
                    onClick={() => actions.toggleReaction(comment.id, reaction.emoji)}
                    aria-pressed={mine}
                    aria-label={COMMENT_LABELS.react(reaction.emoji)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] transition-colors",
                      mine
                        ? "border-brand-500/40 bg-brand-500/10 text-brand-700 dark:text-brand-300"
                        : "border-line bg-surface-2 text-muted hover:border-line-strong",
                    )}
                  >
                    <span aria-hidden>{reaction.emoji}</span>
                    <span>{reaction.userIds.length}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => actions.deleteComment(comment.id)}
        title={COMMENT_LABELS.delete}
        body={COMMENT_LABELS.deleteConfirm}
        confirmLabel={COMMENT_LABELS.delete}
      />
    </article>
  );
}
