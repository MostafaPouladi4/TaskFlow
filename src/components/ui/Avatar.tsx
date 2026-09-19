import { AVATAR_TONES, PRESENCE_LABELS } from "../../constants";
import type { PresenceStatus } from "../../types";
import { cn } from "../../utils/cn";
import { hashToIndex } from "../../utils/text";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: "size-5 text-[9px]",
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-11 text-sm",
  xl: "size-14 text-base",
};

const PRESENCE_CLASSES: Record<PresenceStatus, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-slate-400 dark:bg-slate-500",
};

export interface AvatarProps {
  /** Full name — used for the tooltip and the accessible label. */
  name: string;
  /** Pre-rendered initials from `getInitials`. */
  initials: string;
  /** Stable key for the colour hash; the user id, so colour never shifts. */
  seed?: string;
  size?: AvatarSize;
  presence?: PresenceStatus;
  className?: string;
  /** Draws a ring in the page background colour — needed when overlapping. */
  ring?: boolean;
}

export function Avatar({
  name,
  initials,
  seed,
  size = "md",
  presence,
  className,
  ring = false,
}: AvatarProps) {
  const tone = AVATAR_TONES[hashToIndex(seed ?? name, AVATAR_TONES.length)];

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        role="img"
        aria-label={name}
        title={name}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold ring-1 ring-inset select-none",
          tone,
          SIZE_CLASSES[size],
          ring && "ring-2 ring-surface",
        )}
      >
        {initials}
      </span>

      {presence && (
        <span
          aria-label={PRESENCE_LABELS[presence]}
          title={PRESENCE_LABELS[presence]}
          className={cn(
            "absolute -inset-e-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-surface",
            PRESENCE_CLASSES[presence],
          )}
        />
      )}
    </span>
  );
}

export interface AvatarGroupProps {
  people: { id: string; name: string; avatar: string }[];
  max?: number;
  size?: AvatarSize;
  className?: string;
}

/**
 * Overlapping avatars. Extras collapse into a `+N` chip so a row never wraps
 * and the count stays legible.
 */
export function AvatarGroup({
  people,
  max = 4,
  size = "sm",
  className,
}: AvatarGroupProps) {
  const visible = people.slice(0, max);
  const overflow = people.length - visible.length;

  if (people.length === 0) return null;

  return (
    <div className={cn("flex items-center", className)}>
      {/* `-space-x` is direction-agnostic here because the avatars only need
          to overlap, not to encode order. */}
      <div className="flex items-center -space-x-2 rtl:space-x-reverse">
        {visible.map((person) => (
          <Avatar
            key={person.id}
            name={person.name}
            initials={person.avatar}
            seed={person.id}
            size={size}
            ring
          />
        ))}
      </div>

      {overflow > 0 && (
        <span
          className={cn(
            "ms-1 inline-flex items-center justify-center rounded-full bg-surface-3 font-medium text-muted",
            SIZE_CLASSES[size],
          )}
          title={people
            .slice(max)
            .map((person) => person.name)
            .join("، ")}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
