import { CheckCircle2, Info, TriangleAlert, XCircle, X } from "lucide-react";
import { TOAST_LABELS } from "../../shared/constants/labels";
import { useToast } from "../../shared/hooks/useToast";
import type { ToastTone } from "../../store/appearanceContext";
import { cn } from "../../shared/utils/cn";

const TONE_META: Record<
  ToastTone,
  { icon: typeof CheckCircle2; classes: string; iconClasses: string }
> = {
  success: {
    icon: CheckCircle2,
    classes: "border-emerald-500/25",
    iconClasses: "text-emerald-600 dark:text-emerald-400",
  },
  error: {
    icon: XCircle,
    classes: "border-rose-500/30",
    iconClasses: "text-rose-600 dark:text-rose-400",
  },
  warning: {
    icon: TriangleAlert,
    classes: "border-amber-500/30",
    iconClasses: "text-amber-600 dark:text-amber-400",
  },
  info: {
    icon: Info,
    classes: "border-brand-500/25",
    iconClasses: "text-brand-600 dark:text-brand-400",
  },
};

/**
 * Renders the toast queue.
 *
 * Mounted once at the app root, bottom-centre: that position clears both the
 * sidebar and the detail drawer, and keeps messages in one predictable place.
 */
export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      // `polite` so a confirmation never interrupts what the user is reading.
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 z-80 flex w-full flex-col items-center gap-2 px-4 sm:bottom-6"
    >
      {toasts.map((toast) => {
        const meta = TONE_META[toast.tone];
        const Icon = meta.icon;

        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-surface p-3.5 shadow-lg",
              "animate-toast-in",
              meta.classes,
            )}
          >
            <Icon
              aria-hidden
              className={cn("mt-0.5 size-4.5 shrink-0", meta.iconClasses)}
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-content">{toast.message}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs leading-5 text-muted">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label={TOAST_LABELS.dismiss}
              className="-me-1 -mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-content"
            >
              <X aria-hidden className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
