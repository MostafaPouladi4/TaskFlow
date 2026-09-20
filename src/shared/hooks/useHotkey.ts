import { useEffect, useRef } from "react";

export interface HotkeyOptions {
  /** `event.key`, compared case-insensitively. */
  key: string;
  /** Ctrl (Windows/Linux) or ⌘ (macOS). */
  mod?: boolean;
  shift?: boolean;
  alt?: boolean;
  /** Ignore the combo while the user is typing in a field. */
  allowInInput?: boolean;
  enabled?: boolean;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
}

/** Registers a document-level keyboard shortcut for the component's lifetime. */
export function useHotkey(
  options: HotkeyOptions,
  handler: (event: KeyboardEvent) => void,
): void {
  const {
    key,
    mod = false,
    shift = false,
    alt = false,
    allowInInput = false,
    enabled = true,
  } = options;

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      if (mod && !(event.metaKey || event.ctrlKey)) return;
      if (!mod && (event.metaKey || event.ctrlKey)) return;
      if (shift !== event.shiftKey) return;
      if (alt !== event.altKey) return;
      if (!allowInInput && isEditableTarget(event.target)) return;

      handlerRef.current(event);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [key, mod, shift, alt, allowInInput, enabled]);
}

/** Closes a surface on Escape — the counterpart to `useOnClickOutside`. */
export function useEscapeKey(handler: () => void, enabled = true): void {
  useHotkey({ key: "Escape", allowInInput: true, enabled }, handler);
}
