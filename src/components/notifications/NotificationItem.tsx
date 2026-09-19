import {
  AtSign,
  CheckCircle2,
  Clock,
  MessageSquare,
  PencilLine,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AppNotification, NotificationType } from "../../types";
import { NOTIFICATION_LABELS } from "../../constants/labels";
import type { Lookup } from "../../utils/activityText";
import { describeNotification } from "../../utils/notificationText";
import { formatRelativeTime } from "../../utils/date";
import { cn } from "../../utils/cn";

const TYPE_META: Record<
  NotificationType,
  { icon: LucideIcon; classes: string }
> = {
  mention: { icon: AtSign, classes: "bg-brand-500/10 text-brand-600 dark:text-brand-400" },
  assignment: {
    icon: UserPlus,
    classes: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  comment_reply: {
    icon: MessageSquare,
    classes: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
  due_soon: {
    icon: Clock,
    classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  task_completed: {
    icon: CheckCircle2,
    classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  task_updated: {
    icon: PencilLine,
    classes: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  },
};

export interface NotificationItemProps {
  notification: AppNotification;
  lookup: Lookup;
  onSelect: (notification: AppNotification) => void;
  /** Compact spacing for the dropdown panel. */
  dense?: boolean;
}

/**
 * One row in the notification centre.
 *
 * The sentence is assembled from typed segments rather than HTML, so the actor
 * and the task title can be emphasised without ever injecting markup.
 */
export function NotificationItem({
  notification,
  lookup,
  onSelect,
  dense = false,
}: NotificationItemProps) {
  const meta = TYPE_META[notification.type];
  const Icon = meta.icon;
  const content = describeNotification(notification, lookup);
  const unread = !notification.read;

  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      aria-label={
        unread
          ? `${content.plain} — ${NOTIFICATION_LABELS.unread}`
          : content.plain
      }
      className={cn(
        "flex w-full gap-3 rounded-xl text-start transition-colors duration-150",
        dense ? "p-2.5" : "p-3",
        unread ? "bg-brand-500/4 hover:bg-brand-500/8" : "hover:bg-surface-2",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex size-8 shrink-0 items-center justify-center rounded-lg",
          meta.classes,
        )}
      >
        <Icon className="size-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[13px] leading-6 text-content">
          {content.segments.map((segment, index) => (
            <span
              // Segments are positional and never reorder.
              key={index}
              className={
                segment.kind === "actor" || segment.kind === "task"
                  ? "font-semibold text-content"
                  : undefined
              }
            >
              {segment.value}
            </span>
          ))}
        </span>

        <span className="mt-0.5 block text-[11px] text-subtle">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </span>

      {unread && (
        <span
          aria-hidden
          className="mt-2 size-2 shrink-0 rounded-full bg-brand-500"
        />
      )}
    </button>
  );
}
