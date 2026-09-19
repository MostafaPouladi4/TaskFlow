import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query. Uses `useSyncExternalStore` so the value
 * is read during render (no flash of the wrong layout) and stays correct if
 * the viewport changes before hydration.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** Below Tailwind's `lg` breakpoint — the sidebar becomes a drawer. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 1023px)");
}

export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Tracks the OS colour scheme — the source of truth for theme "system". */
export function useSystemTheme(): "light" | "dark" {
  const subscribe = useCallback((onChange: () => void) => {
    const list = window.matchMedia("(prefers-color-scheme: dark)");
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, []);

  const getSnapshot = useCallback(
    () => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
    [],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => "light" as const);
}

/**
 * True once the component has mounted. Used to defer rendering of anything
 * that would otherwise mismatch between server and client markup.
 */
export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
