import {
  ChevronsUpDown,
  LogOut,
  Monitor,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SETTINGS_LABELS, SHELL_LABELS } from "../../../shared/constants/labels";
import { useAppearance } from "../../../shared/hooks/useAppearance";
import { useToast } from "../../../shared/hooks/useToast";
import { useWorkspace } from "../../../shared/hooks/useWorkspace";
import type { ThemePreference } from "../../../store/appearanceContext";
import { cn } from "../../../shared/utils/cn";
import { Avatar } from "../../../shared/components/ui/Avatar";
import { Menu } from "../../../shared/components/ui/Menu";
import { Tooltip } from "../../../shared/components/ui/Tooltip";

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "light", label: SETTINGS_LABELS.appearance.light, icon: Sun },
  { value: "dark", label: SETTINGS_LABELS.appearance.dark, icon: Moon },
  { value: "system", label: SETTINGS_LABELS.appearance.system, icon: Monitor },
];

export interface AccountMenuProps {
  /** Icon-only rail: just the avatar, with the menu anchored beside it. */
  collapsed?: boolean;
  className?: string;
}

/**
 * Avatar plus account menu: theme choice, profile and sign-out.
 *
 * Shared by the desktop rail and the mobile drawer so the two can't drift.
 */
export function AccountMenu({ collapsed = false, className }: AccountMenuProps) {
  const { currentUser } = useWorkspace();
  const { theme, setTheme } = useAppearance();
  const toast = useToast();
  const navigate = useNavigate();

  const menu = (
    <Menu
      align={collapsed ? "end" : "start"}
      panelClassName="w-60"
      header={
        <div className="px-1 py-0.5">
          <p className="truncate text-[13px] font-semibold text-content">
            {currentUser.name}
          </p>
          <p className="truncate text-[11px] text-subtle">
            {currentUser.email}
          </p>
        </div>
      }
      items={[
        ...THEME_OPTIONS.map((option) => ({
          id: `theme-${option.value}`,
          label: option.label,
          icon: option.icon,
          checked: option.value === theme,
          onSelect: () => setTheme(option.value),
        })),
        {
          id: "profile",
          label: SHELL_LABELS.viewProfile,
          icon: UserRound,
          onSelect: () => void navigate("/settings"),
        },
        {
          id: "sign-out",
          label: SHELL_LABELS.signOut,
          icon: LogOut,
          tone: "danger" as const,
          // There is no session to end in this build, so the entry explains
          // itself rather than pretending to sign out.
          onSelect: () =>
            toast.info(SHELL_LABELS.signOut, {
              description: SHELL_LABELS.signOutHint,
            }),
        },
      ]}
      trigger={({ toggle, triggerProps }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? SHELL_LABELS.account : undefined}
          className={cn(
            "flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-surface-2",
            collapsed ? "justify-center" : "w-full",
          )}
          {...triggerProps}
        >
          <Avatar
            name={currentUser.name}
            initials={currentUser.avatar}
            seed={currentUser.id}
            size="sm"
            presence={currentUser.presence}
          />

          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 text-start">
                <span className="block truncate text-[13px] font-medium text-content">
                  {currentUser.name}
                </span>
                <span className="block truncate text-[10px] text-subtle">
                  {currentUser.title}
                </span>
              </span>

              <ChevronsUpDown
                aria-hidden
                className="size-3.5 shrink-0 text-subtle"
              />
            </>
          )}
        </button>
      )}
    />
  );

  return (
    <div className={cn(collapsed && "flex justify-center", className)}>
      {collapsed ? (
        <Tooltip content={SHELL_LABELS.account} side="end">
          {menu}
        </Tooltip>
      ) : (
        menu
      )}
    </div>
  );
}
