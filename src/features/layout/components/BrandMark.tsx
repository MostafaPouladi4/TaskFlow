import { CheckCheck } from "lucide-react";
import { cn } from "../../../shared/utils/cn";

export interface BrandMarkProps {
  size?: "sm" | "md";
  className?: string;
}

/** The app's logo. A gradient is used here only — nowhere else in the shell. */
export function BrandMark({ size = "md", className }: BrandMarkProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-sm",
        size === "sm" ? "size-8" : "size-9",
        className,
      )}
    >
      <CheckCheck className={size === "sm" ? "size-4" : "size-4.5"} />
    </span>
  );
}
