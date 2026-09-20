import { cn } from "../../shared/utils/cn";

export interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

/** A keycap. Used in the search trigger and the shortcuts hint. */
export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border border-line bg-surface-2 px-1",
        "font-sans text-[10px] font-medium text-muted",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
