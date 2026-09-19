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

const EXIT_MS = 200;

export type DrawerWidth = "sm" | "md" | "lg";
export type DrawerSide = "end" | "start";

const WIDTH_CLASSES: Record<DrawerWidth, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-xl",
};

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: DrawerWidth;
  /** `end` is the left edge in RTL, `start` the right — set by `dir`. */
  side?: DrawerSide;
  headerAccessory?: ReactNode;
}

/**
 * A side panel that is full-width on phones and a fixed column on larger
 * screens. Slides in from a logical edge, so the direction is correct in RTL
 * without any per-locale branching.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "lg",
  side = "end",
  headerAccessory,
}: DrawerProps) {
  const { mounted, closing } = useMountTransition(open, EXIT_MS);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useLockBodyScroll(mounted);
  useFocusTrap(panelRef, mounted && !closing);
  useEscapeKey(onClose, open);

  if (!mounted) return null;

  const atStart = side === "start";

  return createPortal(
    <div className="fixed inset-0 z-50">
      <Backdrop closing={closing} onClick={onClose} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "absolute inset-y-0 flex w-full flex-col outline-none",
          "border-line bg-surface shadow-lg",
          WIDTH_CLASSES[width],
          atStart ? "inset-s-0 border-e" : "inset-e-0 border-s",
          closing
            ? atStart
              ? "animate-drawer-out-start"
              : "animate-drawer-out"
            : atStart
              ? "animate-drawer-in-start"
              : "animate-drawer-in",
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="truncate text-base font-semibold text-content"
            >
              {title}
            </h2>
            {description && (
              <div className="mt-1 text-xs text-muted">{description}</div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {headerAccessory}
            <IconButton
              icon={X}
              label={ACTION_LABELS.close}
              size="sm"
              onClick={onClose}
              className="-me-1 -mt-1"
            />
          </div>
        </header>

        <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto">
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
