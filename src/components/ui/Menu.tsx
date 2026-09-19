import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { useCallback, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "../../utils/cn";
import { useDisclosure, useOnClickOutside } from "../../hooks/useDisclosure";
import { useMountTransition } from "../../hooks/useMountTransition";

export type MenuAlign = "start" | "end";

export interface MenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  /**
   * Turns the row into a radio entry and draws a check at the trailing edge.
   * Leave undefined for a plain action row.
   */
  checked?: boolean;
  /** `danger` colours the row red — used for destructive entries. */
  tone?: "default" | "danger";
  disabled?: boolean;
  onSelect: () => void;
}

export interface MenuTriggerState {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  /** Spread onto the trigger button so assistive tech announces the popup. */
  triggerProps: {
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
  };
}

export interface MenuProps {
  /** Render prop — the trigger owns its own visuals, the menu owns the state. */
  trigger: (state: MenuTriggerState) => ReactNode;
  items: MenuItem[];
  align?: MenuAlign;
  header?: ReactNode;
  footer?: ReactNode;
  panelClassName?: string;
}

const EXIT_MS = 140;

/**
 * An anchored dropdown menu.
 *
 * Arrow keys move through the items, Home/End jump to the ends, and Escape or
 * an outside press closes it and hands focus back to the trigger — so the menu
 * is fully operable without a mouse.
 */
export function Menu({
  trigger,
  items,
  align = "end",
  header,
  footer,
  panelClassName,
}: MenuProps) {
  const { isOpen, toggle, close } = useDisclosure();
  const { mounted, closing } = useMountTransition(isOpen, EXIT_MS);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeAndRestoreFocus = useCallback((): void => {
    const active = document.activeElement;
    const wasInsidePanel =
      active instanceof HTMLElement && panelRef.current?.contains(active);

    close();

    if (wasInsidePanel) wrapperRef.current?.focus({ preventScroll: true });
  }, [close]);

  useOnClickOutside(wrapperRef, closeAndRestoreFocus, isOpen);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    const panel = panelRef.current;
    if (!panel) return;

    const rows = [
      ...panel.querySelectorAll<HTMLElement>(
        '[role^="menuitem"]:not([aria-disabled="true"])',
      ),
    ];
    if (rows.length === 0) return;

    const current = rows.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        rows[(current + 1) % rows.length].focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        rows[(current - 1 + rows.length) % rows.length].focus();
        break;
      case "Home":
        event.preventDefault();
        rows[0].focus();
        break;
      case "End":
        event.preventDefault();
        rows[rows.length - 1].focus();
        break;
      default:
        break;
    }
  };

  return (
    <div ref={wrapperRef} tabIndex={-1} className="relative inline-flex outline-none">
      {trigger({
        isOpen,
        toggle,
        close,
        triggerProps: { "aria-haspopup": "menu", "aria-expanded": isOpen },
      })}

      {mounted && (
        <div
          ref={panelRef}
          role="menu"
          aria-orientation="vertical"
          onKeyDown={handleKeyDown}
          className={cn(
            "absolute top-full z-50 mt-1.5 min-w-52 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-lg",
            align === "end" ? "inset-e-0" : "inset-s-0",
            closing ? "animate-scale-out" : "animate-scale-in",
            panelClassName,
          )}
        >
          {header && (
            <div className="border-b border-line px-2.5 py-2">{header}</div>
          )}

          {items.map((item) => {
            const Icon = item.icon;
            const isRadio = item.checked !== undefined;

            return (
              <button
                key={item.id}
                type="button"
                role={isRadio ? "menuitemradio" : "menuitem"}
                aria-checked={item.checked}
                aria-disabled={item.disabled || undefined}
                disabled={item.disabled}
                onClick={() => {
                  item.onSelect();
                  closeAndRestoreFocus();
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-[13px] font-medium",
                  "transition-colors duration-100",
                  item.disabled
                    ? "cursor-not-allowed text-subtle"
                    : item.tone === "danger"
                      ? "text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                      : "text-content hover:bg-surface-2",
                )}
              >
                {Icon && <Icon aria-hidden className="size-4 shrink-0" />}

                <span className="min-w-0 flex-1 truncate">{item.label}</span>

                <span className="flex size-4 shrink-0 items-center justify-center">
                  {item.checked && (
                    <Check aria-hidden className="size-3.5 text-brand-500" />
                  )}
                </span>
              </button>
            );
          })}

          {footer && (
            <div className="mt-1 border-t border-line px-2.5 pt-2 pb-1">
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
