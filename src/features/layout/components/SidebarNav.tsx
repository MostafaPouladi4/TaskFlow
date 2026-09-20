import { NavLink } from "react-router-dom";
import { NOTIFICATION_LABELS, SHELL_LABELS } from "../../../shared/constants/labels";
import { NAV_SECTIONS } from "../../../shared/constants/navigation";
import { cn } from "../../../shared/utils/cn";
import { formatNumber } from "../../../shared/utils/text";
import { Tooltip } from "../../../shared/components/ui/Tooltip";

export interface SidebarNavProps {
  /** Icon-only rail. Labels stay in the accessibility tree as tooltips. */
  collapsed?: boolean;
  /** Called after a link is followed — used to close the mobile drawer. */
  onNavigate?: () => void;
  /** Unread counts keyed by nav item id. */
  badges?: Record<string, number>;
}

const ITEM_BASE =
  "group relative flex w-full items-center gap-3 rounded-xl text-sm font-medium transition-colors duration-150";

/**
 * The navigation list, shared by the desktop rail and the mobile drawer.
 *
 * The active item is marked with `aria-current="page"` as well as colour, so
 * the state is not conveyed by hue alone.
 */
export function SidebarNav({
  collapsed = false,
  onNavigate,
  badges = {},
}: SidebarNavProps) {
  return (
    <nav aria-label={SHELL_LABELS.primaryNav} className="flex flex-col gap-5">
      {NAV_SECTIONS.map((section) => (
        <div key={section.id} className="flex flex-col gap-1">
          {section.label && !collapsed && (
            <p className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-subtle uppercase">
              {section.label}
            </p>
          )}

          {section.items.map((item) => {
            const Icon = item.icon;
            const badge = badges[item.id] ?? 0;

            const link = (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.to === "/"}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    ITEM_BASE,
                    collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
                    isActive
                      ? "bg-brand-500/10 text-brand-700 dark:text-brand-300"
                      : "text-muted hover:bg-surface-2 hover:text-content",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute inset-y-1.5 inset-s-0 w-0.5 rounded-full bg-brand-500"
                      />
                    )}

                    <span className="relative shrink-0">
                      <Icon aria-hidden className="size-4.5" />

                      {badge > 0 && collapsed && (
                        <span
                          aria-hidden
                          className="absolute -top-1 -end-1 size-2 rounded-full bg-brand-500 ring-2 ring-surface"
                        />
                      )}
                    </span>

                    {!collapsed && (
                      <>
                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
                        </span>

                        {badge > 0 && (
                          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-semibold text-white">
                            {formatNumber(badge)}
                            <span className="sr-only">
                              {" "}
                              {NOTIFICATION_LABELS.unreadItems}
                            </span>
                          </span>
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            );

            return collapsed ? (
              <Tooltip key={item.id} content={item.label} side="end" className="w-full">
                {link}
              </Tooltip>
            ) : (
              link
            );
          })}
        </div>
      ))}
    </nav>
  );
}
