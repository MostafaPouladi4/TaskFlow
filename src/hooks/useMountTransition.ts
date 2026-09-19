import { useEffect, useState } from "react";

export interface MountTransition {
  /** Whether the element should be in the DOM at all. */
  mounted: boolean;
  /** True while the exit animation is playing. */
  closing: boolean;
}

/**
 * Keeps an element mounted long enough to play its exit animation.
 *
 * A dialog that unmounts the instant `open` flips to false can only animate
 * in, never out. This defers the unmount by the animation's duration so both
 * halves of the transition are visible.
 */
export function useMountTransition(
  visible: boolean,
  durationMs: number,
): MountTransition {
  const [mounted, setMounted] = useState(visible);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setClosing(false);
      return;
    }

    if (!mounted) return;

    setClosing(true);
    const timer = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, durationMs);

    return () => window.clearTimeout(timer);
  }, [visible, mounted, durationMs]);

  return { mounted, closing };
}
