import { useCallback, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { SHELL_LABELS } from "../../../shared/constants/labels";
import { useHotkey } from "../../../shared/hooks/useHotkey";
import { useSidebarCollapsed } from "../../../shared/hooks/useSidebarCollapsed";
import type { AppShellContext } from "../../../shared/hooks/useAppShell";
import { TaskFormModal } from "../../tasks/components/TaskFormModal";
import { CommandPalette } from "./CommandPalette";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/**
 * The application frame: rail, header, routed content, and the two overlays
 * that belong to the app rather than to any one page (the ⌘K palette and the
 * create-task dialog).
 *
 * Hosting those two here is what lets the dashboard, the task list and the
 * palette all open the same dialog without coordinating through props.
 */
export function AppShell() {
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const openCreateTask = useCallback(() => setCreateOpen(true), []);
  const openSearch = useCallback(() => setPaletteOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const closeCreate = useCallback(() => setCreateOpen(false), []);

  // `allowInInput` on both: the shortcuts are modifier combos, so they should
  // work even while the caret sits in a comment box.
  useHotkey({ key: "k", mod: true, allowInInput: true }, (event) => {
    event.preventDefault();
    setPaletteOpen(true);
  });

  useHotkey({ key: "n", mod: true, allowInInput: true }, (event) => {
    event.preventDefault();
    setCreateOpen(true);
  });

  const context = useMemo<AppShellContext>(
    () => ({ openCreateTask }),
    [openCreateTask],
  );

  return (
    <div className="flex min-h-svh">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:inset-s-3 focus:top-3 focus:z-90 focus:rounded-lg focus:border focus:border-line focus:bg-surface focus:px-3.5 focus:py-2 focus:text-sm focus:font-medium focus:text-content focus:shadow-lg"
      >
        {SHELL_LABELS.skipToContent}
      </a>

      <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />

      <MobileNav open={mobileNavOpen} onClose={closeMobileNav} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileNav={openMobileNav} onOpenSearch={openSearch} />

        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 flex-1 px-4 py-6 outline-none lg:px-6 lg:py-8"
        >
          <div className="mx-auto w-full max-w-6xl">
            <Outlet context={context} />
          </div>
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={closePalette}
        onCreateTask={openCreateTask}
      />

      <TaskFormModal open={createOpen} onClose={closeCreate} />
    </div>
  );
}
