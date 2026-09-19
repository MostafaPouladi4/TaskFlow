import { TAG_TONES } from "../../constants/tones";
import type { Tag } from "../../types";
import { cn } from "../../utils/cn";
import { formatNumber } from "../../utils/text";

export interface TaskTagsProps {
  tags: Tag[];
  /** Beyond this count the rest collapse into a `+N` chip. */
  max?: number;
  className?: string;
}

/** Tag chips. The overflow chip keeps its members reachable via a tooltip. */
export function TaskTags({ tags, max = 3, className }: TaskTagsProps) {
  if (tags.length === 0) return null;

  const visible = tags.slice(0, max);
  const rest = tags.slice(max);

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {visible.map((tag) => (
        <span
          key={tag.id}
          className={cn(
            "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap",
            TAG_TONES[tag.tone].chip,
          )}
        >
          {tag.label}
        </span>
      ))}

      {rest.length > 0 && (
        <span
          title={rest.map((tag) => tag.label).join("، ")}
          className="inline-flex items-center rounded-md bg-surface-3 px-1.5 py-0.5 text-[10px] font-medium text-muted"
        >
          +{formatNumber(rest.length)}
        </span>
      )}
    </div>
  );
}
