import { useState } from "react";
import { CornerDownRight, MessageSquare, X } from "lucide-react";
import { COMMENT_LABELS, GENERIC_LABELS } from "../../constants/labels";
import { useWorkspace } from "../../hooks/useWorkspace";
import { useTaskCommentThreads } from "../../hooks/useTasks";
import type { Comment, ID } from "../../types";
import { cn } from "../../utils/cn";
import { countThreadMessages } from "../../utils/comments";
import { formatNumber } from "../../utils/text";
import { EmptyState } from "../ui/States";
import { CommentComposer } from "./CommentComposer";
import { CommentThreadView } from "./CommentThread";

export interface CommentListProps {
  taskId: ID;
  className?: string;
}

/**
 * The comment section of a task.
 *
 * One composer serves both new comments and replies — replying swaps it into
 * reply mode with a banner — so there is a single place to type rather than one
 * box per thread.
 */
export function CommentList({ taskId, className }: CommentListProps) {
  const threads = useTaskCommentThreads(taskId);
  const { actions, index } = useWorkspace();

  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const total = threads.reduce(
    (sum, thread) => sum + countThreadMessages(thread),
    0,
  );

  const submit = async (body: string): Promise<boolean> => {
    const created = await actions.addComment(taskId, body, replyTo?.id ?? null);
    if (created) setReplyTo(null);
    return created !== null;
  };

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <header className="flex items-center gap-2">
        <h3 className="text-[13px] font-semibold text-content">
          {COMMENT_LABELS.title}
        </h3>

        {total > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-3 px-1.5 text-[10px] font-medium text-muted">
            {formatNumber(total)}
          </span>
        )}
      </header>

      {replyTo && (
        <div className="flex items-center gap-2 rounded-lg bg-brand-500/8 px-2.5 py-1.5 text-[11px] text-brand-700 dark:text-brand-300">
          <CornerDownRight aria-hidden className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            {COMMENT_LABELS.reply} به{" "}
            {index.users.get(replyTo.authorId)?.name ?? GENERIC_LABELS.unknownUser}
          </span>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            aria-label={COMMENT_LABELS.cancelReply}
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-brand-500/15"
          >
            <X aria-hidden className="size-3" />
          </button>
        </div>
      )}

      <CommentComposer
        key={replyTo?.id ?? "root"}
        placeholder={
          replyTo ? COMMENT_LABELS.replyPlaceholder : COMMENT_LABELS.placeholder
        }
        onSubmit={submit}
      />

      {threads.length === 0 ? (
        <EmptyState
          variant="compact"
          icon={MessageSquare}
          title={COMMENT_LABELS.empty}
          body={COMMENT_LABELS.emptyHint}
        />
      ) : (
        <div className="flex flex-col gap-5 border-t border-line pt-4">
          {threads.map((thread) => (
            <CommentThreadView
              key={thread.comment.id}
              thread={thread}
              onReply={setReplyTo}
            />
          ))}
        </div>
      )}
    </section>
  );
}
