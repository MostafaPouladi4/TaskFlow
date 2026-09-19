import { useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { ACTION_LABELS } from "../../constants/labels";
import { cn } from "../../utils/cn";
import { useFocusTrap, useLockBodyScroll } from "../../hooks/useDisclosure";
import { useEscapeKey } from "../../hooks/useHotkey";
import { useMountTransition } from "../../hooks/useMountTransition";
import { Backdrop } from "./Overlay";
import { IconButton } from "./IconButton";

const EXIT_MS = 160;

export type ModalSize = "sm" | "md" | "lg" | "xl";

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  /** Set when the caller renders its own close affordance. */
  hideClose?: boolean;
  /** Blocks backdrop/Escape dismissal while a write is in flight. */
  dismissible?: boolean;
}

/**
 * A centred dialog on desktop that becomes a bottom sheet on phones — the
 * form factors differ enough that shrinking the desktop layout would leave
 * the primary action in an awkward place.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  hideClose = false,
  dismissible = true,
}: ModalProps) {
  const { mounted, closing } = useMountTransition(open, EXIT_MS);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useLockBodyScroll(mounted);
  useFocusTrap(panelRef, mounted && !closing);
  useEscapeKey(() => {
    if (dismissible) onClose();
  }, open);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-end justify-center sm:items-center sm:p-6">
      <Backdrop
        closing={closing}
        onClick={dismissible ? onClose : undefined}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex max-h-[92svh] w-full flex-col outline-none",
          "border border-line bg-surface shadow-lg",
          "rounded-t-3xl sm:rounded-2xl",
          SIZE_CLASSES[size],
          closing ? "animate-modal-out" : "animate-modal-in",
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="truncate text-base font-semibold text-content"
            >
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-0.5 text-xs text-muted">
                {description}
              </p>
            )}
          </div>

          {!hideClose && (
            <IconButton
              icon={X}
              label={ACTION_LABELS.close}
              size="sm"
              onClick={onClose}
              disabled={!dismissible}
              className="-me-1 -mt-1"
            />
          )}
        </header>

        <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {children}
        </div>

        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-line bg-surface-2/50 px-5 py-3.5">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
