import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { APP, SHELL_LABELS } from "../../../shared/constants/labels";
import { useWorkspace } from "../../../shared/hooks/useWorkspace";
import { cn } from "../../../shared/utils/cn";
import { Tooltip } from "../../../shared/components/ui/Tooltip";
import { AccountMenu } from "./AccountMenu";
import { BrandMark } from "./BrandMark";
import { SidebarNav } from "./SidebarNav";

export interface SidebarProps {
  /** Persisted collapse state, owned by `AppShell`. */
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

/**
 * The desktop rail.
 *
 * Collapsing keeps the icons and drops the labels, so the same navigation
 * stays usable at either width instead of being swapped for something else.
 */
export function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  const { unreadCount } = useWorkspace();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col border-e border-line bg-surface",
        "transition-[width] duration-200 ease-out lg:flex",
        collapsed ? "w-18" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-2.5",
          collapsed ? "justify-center px-2" : "px-5",
        )}
      >
        <BrandMark />

        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-content">
              {APP.name}
            </span>
            <span className="block truncate text-[10px] text-subtle">
              {APP.tagline}
            </span>
          </span>
        )}
      </div>

      <div
        className={cn(
          "scrollbar-slim flex-1 overflow-y-auto py-2",
          collapsed ? "px-2" : "px-3",
        )}
      >
        <SidebarNav
          collapsed={collapsed}
          badges={{ notifications: unreadCount }}
        />
      </div>

      <div
        className={cn(
          "flex shrink-0 flex-col gap-2 border-t border-line p-3",
          collapsed && "items-center",
        )}
      >
        {collapsed ? (
          <Tooltip content={SHELL_LABELS.expandSidebar} side="end">
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={SHELL_LABELS.expandSidebar}
              className="inline-flex size-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-content"
            >
              <ChevronsLeft aria-hidden className="size-4" />
            </button>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-content"
          >
            <ChevronsRight aria-hidden className="size-4 shrink-0" />
            {SHELL_LABELS.collapseSidebar}
          </button>
        )}

        <AccountMenu collapsed={collapsed} />
      </div>
    </aside>
  );
}
