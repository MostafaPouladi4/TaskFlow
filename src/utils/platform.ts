/**
 * Platform detection, kept in one place so keyboard hints match the user's
 * actual modifier key instead of assuming macOS.
 */
export function isMacLike(): boolean {
  if (typeof navigator === "undefined") return false;

  const source = navigator.userAgent || "";
  return /Mac|iPhone|iPad|iPod/.test(source);
}

/** The label for the "primary" modifier: ⌘ on Apple hardware, Ctrl elsewhere. */
export function modKeyLabel(): string {
  return isMacLike() ? "⌘" : "Ctrl";
}

/** `⌘K` / `Ctrl K` — ready to drop into a `<Kbd>`. */
export function shortcutLabel(key: string): string {
  return isMacLike() ? `${modKeyLabel()}${key}` : `${modKeyLabel()} ${key}`;
}
