import { useCallback, useEffect, useRef, useState } from "react";

/**
 * `useState` backed by localStorage.
 *
 * Reads lazily (only on first render) and writes on change. Every access is
 * wrapped in try/catch: storage throws in private windows and when the quota
 * is exceeded, and a persistence failure must never break the UI.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
): [T, (value: T | ((previous: T) => T)) => void] {
  const initialRef = useRef(initialValue);

  const readInitial = useCallback((): T => {
    const fallback =
      typeof initialRef.current === "function"
        ? (initialRef.current as () => T)()
        : initialRef.current;

    if (typeof window === "undefined") return fallback;

    try {
      const stored = window.localStorage.getItem(key);
      if (stored === null) return fallback;
      return JSON.parse(stored) as T;
    } catch {
      return fallback;
    }
  }, [key]);

  const [value, setValue] = useState<T>(readInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable or full — the in-memory value is still correct.
    }
  }, [key, value]);

  // Keep two open tabs in sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent): void => {
      if (event.key !== key || event.newValue === null) return;

      try {
        setValue(JSON.parse(event.newValue) as T);
      } catch {
        // Ignore malformed values written by another tab.
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  return [value, setValue];
}
