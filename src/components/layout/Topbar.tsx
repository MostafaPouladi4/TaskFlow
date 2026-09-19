import { Menu, Search } from "lucide-react";
import { APP, SHELL_LABELS } from "../../constants/labels";
import { shortcutLabel } from "../../utils/platform";
import { IconButton } from "../ui/IconButton";
import { Kbd } from "../ui/Kbd";
import { NotificationBell } from "../notifications/NotificationBell";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";

export interface TopbarProps {
  onOpenMobileNav: () => void;
  onOpenSearch: () => void;
}

/**
 * The sticky header.
 *
 * On desktop it carries the search affordance; on phones that slot becomes the
 * navigation trigger, since the rail is hidden at that width.
 */
export function Topbar({ onOpenMobileNav, onOpenSearch }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-line bg-surface/85 px-4 backdrop-blur-md lg:px-6">
      <IconButton
        icon={Menu}
        label={SHELL_LABELS.openMenu}
        variant="ghost"
        onClick={onOpenMobileNav}
        className="lg:hidden"
      />

      <span className="flex items-center gap-2 lg:hidden">
        <BrandMark size="sm" />
        <span className="text-sm font-semibold text-content">{APP.name}</span>
      </span>

      <button
        type="button"
        onClick={onOpenSearch}
        className="hidden h-9 w-full max-w-80 items-center gap-2.5 rounded-xl border border-line bg-surface-2 px-3 text-start text-[13px] text-subtle transition-colors hover:border-line-strong hover:text-muted lg:flex"
      >
        <Search aria-hidden className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">
          {SHELL_LABELS.searchPlaceholder}
        </span>
        <Kbd>{shortcutLabel("K")}</Kbd>
      </button>

      <div className="ms-auto flex items-center gap-1">
        <IconButton
          icon={Search}
          label={SHELL_LABELS.openSearch}
          variant="ghost"
          onClick={onOpenSearch}
          className="lg:hidden"
        />

        <ThemeToggle />
        <NotificationBell />
      </div>
    </header>
  );
}
