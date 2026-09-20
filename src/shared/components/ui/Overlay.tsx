import { cn } from "../../shared/utils/cn";

export interface BackdropProps {
  /** True while the exit animation plays, so the fade matches the panel. */
  closing: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * The dimmed layer behind a dialog or drawer.
 *
 * Hidden from assistive tech: it is decoration, and the panel already
 * announces itself as a dialog. Clicking it is a convenience, so Escape and
 * the close button remain the accessible ways out.
 */
export function Backdrop({ closing, onClick, className }: BackdropProps) {
  return (
    <div
      aria-hidden
      onClick={onClick}
      className={cn(
        "absolute inset-0 bg-overlay backdrop-blur-[2px]",
        closing ? "animate-fade-out" : "animate-fade-in",
        className,
      )}
    />
  );
}
