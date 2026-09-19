import { GENERIC_LABELS } from "../../constants/labels";
import type { User } from "../../types";
import { cn } from "../../utils/cn";
import { Avatar, AvatarGroup } from "../ui/Avatar";

export interface TaskPeopleProps {
  assignee: User | null;
  members: User[];
  /** `assignee` shows one person; `group` adds the related members. */
  variant?: "assignee" | "group";
  size?: "xs" | "sm" | "md";
  className?: string;
}

/**
 * Who is on the task.
 *
 * The assignee leads the group so the row reads as ownership first,
 * collaboration second.
 */
export function TaskPeople({
  assignee,
  members,
  variant = "assignee",
  size = "xs",
  className,
}: TaskPeopleProps) {
  if (!assignee) {
    if (variant === "assignee") {
      return (
        <span className={cn("text-xs text-subtle", className)}>
          {GENERIC_LABELS.unassigned}
        </span>
      );
    }

    return members.length > 0 ? (
      <AvatarGroup people={members} size={size} className={className} />
    ) : null;
  }

  if (variant === "assignee") {
    return (
      <Avatar
        name={assignee.name}
        initials={assignee.avatar}
        seed={assignee.id}
        size={size}
        className={className}
      />
    );
  }

  const others = members.filter((member) => member.id !== assignee.id);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Avatar
        name={assignee.name}
        initials={assignee.avatar}
        seed={assignee.id}
        size={size}
        ring={others.length > 0}
      />
      {others.length > 0 && <AvatarGroup people={others} size={size} />}
    </div>
  );
}
