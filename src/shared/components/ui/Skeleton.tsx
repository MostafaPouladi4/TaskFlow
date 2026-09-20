import { cn } from "../../shared/utils/cn";

export interface SkeletonProps {
  className?: string;
  /** Renders a circle instead of a rounded rectangle. */
  circle?: boolean;
}

/**
 * Loading placeholder. A moving sheen makes it read as "loading" rather than
 * as a broken empty box, and the whole thing is hidden from assistive tech —
 * the surrounding region announces its busy state instead.
 */
export function Skeleton({ className, circle = false }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative block overflow-hidden bg-surface-3",
        "bg-[linear-gradient(90deg,transparent_0%,color-mix(in_oklab,var(--app-surface)_60%,transparent)_50%,transparent_100%)] bg-[length:200%_100%]",
        "animate-shimmer",
        circle ? "rounded-full" : "rounded-lg",
        className,
      )}
    />
  );
}

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }, (_unused, index) => (
        <Skeleton
          key={index}
          className={cn("h-3.5", index === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

/** A stack of placeholder rows shaped like the task list. */
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-line" aria-hidden>
      {Array.from({ length: rows }, (_unused, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3.5">
          <Skeleton circle className="size-5" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-20 rounded-lg" />
          <Skeleton circle className="size-7" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: count }, (_unused, index) => (
        <div
          key={index}
          className="rounded-2xl border border-line bg-surface p-5"
        >
          <Skeleton className="size-9 rounded-xl" />
          <Skeleton className="mt-4 h-7 w-16" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}
