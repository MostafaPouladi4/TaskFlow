import { useRef } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NOTIFICATION_LABELS } from "../../../shared/constants/labels";
import { useDisclosure, useOnClickOutside } from "../../../shared/hooks/useDisclosure";
import { useEscapeKey } from "../../../shared/hooks/useHotkey";
import { useMountTransition } from "../../../shared/hooks/useMountTransition";
import { useLookup, useInboxNotifications } from "../../../shared/hooks/useTasks";
import { useWorkspace } from "../../../shared/hooks/useWorkspace";
import type { AppNotification } from "../../../shared/types";
import { cn } from "../../../shared/utils/cn";
import { formatNumber } from "../../../shared/utils/text";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { NotificationList } from "./NotificationList";

const EXIT_MS = 160;

export interface NotificationBellProps {
  className?: string;
}

/**
 * The bell and its panel.
 *
 * A popover rather than a menu: the contents are a feed of links, not a list of
 * commands, so `role="menu"` would misdescribe it to assistive tech.
 */
export function NotificationBell({ className }: NotificationBellProps) {
  const { unreadCount, actions } = useWorkspace();
  const notifications = useInboxNotifications();
  const lookup = useLookup();
  const navigate = useNavigate();

  const { isOpen, close, toggle } = useDisclosure();
  const { mounted, closing } = useMountTransition(isOpen, EXIT_MS);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(wrapperRef, close, isOpen);
  useEscapeKey(close, isOpen);

  const handleSelect = (notification: AppNotification): void => {
    actions.markNotificationRead(notification.id);

    if (notification.taskId) {
      close();
      void navigate(`/tasks/${notification.taskId}`);
    }
  };

  const label =
    unreadCount > 0
      ? `${NOTIFICATION_LABELS.title} — ${formatNumber(unreadCount)} ${NOTIFICATION_LABELS.unread}`
      : NOTIFICATION_LABELS.title;

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <IconButton
        icon={Bell}
        label={label}
        variant="ghost"
        onClick={toggle}
        indicator={unreadCount > 0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      />

      {mounted && (
        <div
          role="dialog"
          aria-label={NOTIFICATION_LABELS.title}
          className={cn(
            "fixed inset-x-4 top-16 z-50 origin-top rounded-2xl border border-line bg-surface shadow-lg",
            "sm:absolute sm:inset-x-auto sm:inset-e-0 sm:top-full sm:mt-2 sm:w-88",
            closing ? "animate-scale-out" : "animate-scale-in",
          )}
        >
          <header className="flex items-center gap-2 border-b border-line px-3.5 py-3">
            <h2 className="text-[13px] font-semibold text-content">
              {NOTIFICATION_LABELS.title}
            </h2>

            {unreadCount > 0 && (
              <>
                <span className="inline-flex h-5 items-center rounded-full bg-brand-500/10 px-1.5 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                  {formatNumber(unreadCount)}
                </span>

                <button
                  type="button"
                  onClick={actions.markAllNotificationsRead}
                  className="ms-auto inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-content"
                >
                  <CheckCheck aria-hidden className="size-3.5" />
                  {NOTIFICATION_LABELS.markAllRead}
                </button>
              </>
            )}
          </header>

          <div className="scrollbar-slim max-h-96 overflow-y-auto p-2">
            <NotificationList
              dense
              notifications={notifications}
              lookup={lookup}
              onSelect={handleSelect}
            />
          </div>

          <footer className="border-t border-line p-1.5">
            <button
              type="button"
              onClick={() => {
                close();
                void navigate("/notifications");
              }}
              className="w-full rounded-xl px-3 py-2 text-[12px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-content"
            >
              {NOTIFICATION_LABELS.viewAll}
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}
