import type { ComponentPropsWithoutRef } from "react";
import { Loader2, Search, X } from "lucide-react";
import { SEARCH_LABELS } from "../../shared/constants/labels";
import { cn } from "../../shared/utils/cn";
import { CONTROL_BASE } from "./Field";

export interface SearchInputProps
  extends Omit<ComponentPropsWithoutRef<"input">, "size" | "type"> {
  /** Shows a spinner in place of the search glyph. */
  loading?: boolean;
  size?: "sm" | "md";
  onClear?: () => void;
}

/**
 * The search control used everywhere a list can be filtered. The clear button
 * only appears when there is something to clear, and it is a real button so it
 * is reachable by keyboard.
 */
export function SearchInput({
  loading = false,
  size = "md",
  onClear,
  className,
  value,
  ...rest
}: SearchInputProps) {
  const hasValue = typeof value === "string" && value.length > 0;

  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-s-3 top-1/2 flex -translate-y-1/2 items-center">
        {loading ? (
          <Loader2 aria-hidden className="size-4 animate-spin text-subtle" />
        ) : (
          <Search aria-hidden className="size-4 text-subtle" />
        )}
      </span>

      <input
        type="search"
        value={value}
        className={cn(
          CONTROL_BASE,
          size === "sm" ? "h-9 rounded-lg text-sm" : "h-10 rounded-xl text-sm",
          "ps-9 pe-9",
          "hover:border-line-strong focus:border-brand-500",
          // Hide the browser's own clear affordance; we render our own.
          "[&::-webkit-search-cancel-button]:appearance-none",
          className,
        )}
        {...rest}
      />

      {hasValue && (
        <button
          type="button"
          onClick={onClear}
          aria-label={SEARCH_LABELS.clear}
          className="absolute inset-e-2.5 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-subtle transition-colors hover:bg-surface-2 hover:text-content"
        >
          <X aria-hidden className="size-3.5" />
        </button>
      )}
    </div>
  );
}
