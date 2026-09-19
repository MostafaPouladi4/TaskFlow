import { APP, SHELL_LABELS } from "../../constants/labels";
import { useWorkspace } from "../../hooks/useWorkspace";
import { Drawer } from "../ui/Drawer";
import { AccountMenu } from "./AccountMenu";
import { SidebarNav } from "./SidebarNav";

export interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

/**
 * The phone navigation drawer.
 *
 * It renders the same nav list as the desktop rail — always expanded, never
 * collapsed — so a section can't exist on one and be missing from the other.
 */
export function MobileNav({ open, onClose }: MobileNavProps) {
  const { unreadCount } = useWorkspace();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="start"
      width="sm"
      title={APP.name}
      description={APP.tagline}
    >
      <div className="flex min-h-full flex-col">
        <div className="flex-1 px-3 py-4">
          <SidebarNav
            onNavigate={onClose}
            badges={{ notifications: unreadCount }}
          />
        </div>

        <div className="border-t border-line p-3">
          <p className="px-1 pb-2 text-[10px] font-semibold tracking-wider text-subtle uppercase">
            {SHELL_LABELS.account}
          </p>
          <AccountMenu />
        </div>
      </div>
    </Drawer>
  );
}
