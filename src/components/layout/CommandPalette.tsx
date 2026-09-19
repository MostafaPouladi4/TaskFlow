import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  CornerDownLeft,
  FolderKanban,
  ListChecks,
  Plus,
  Search,
  SunMoon,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ACTION_LABELS, PALETTE_LABELS } from "../../constants/labels";
import { NAV_ITEMS } from "../../constants/navigation";
import { useAppearance } from "../../hooks/useAppearance";
import { useFocusTrap, useLockBodyScroll } from "../../hooks/useDisclosure";
import { useEscapeKey } from "../../hooks/useHotkey";
import { useMountTransition } from "../../hooks/useMountTransition";
import { useWorkspace } from "../../hooks/useWorkspace";
import { cn } from "../../utils/cn";
import { scoreFields } from "../../utils/search";
import { toPersianDigits } from "../../utils/text";
import { Avatar } from "../ui/Avatar";
import { Kbd } from "../ui/Kbd";
import { Backdrop } from "../ui/Overlay";

const EXIT_MS = 150;
const MAX_PER_SECTION = 5;

type PaletteKind = "navigation" | "task" | "project" | "person" | "action";

interface PaletteItem {
  id: string;
  kind: PaletteKind;
  label: string;
  /** Secondary line — a task code, a role, an email. */
  hint?: string;
  icon: LucideIcon;
  /** When set, an avatar is drawn instead of the icon. */
  initials?: string;
  /** Extra text folded into the match, beyond label and hint. */
  keywords?: string;
  run: () => void;
}

const SECTION_ORDER: PaletteKind[] = [
  "navigation",
  "task",
  "project",
  "person",
  "action",
];

const SECTION_LABELS: Record<PaletteKind, string> = {
  navigation: PALETTE_LABELS.sections.navigation,
  task: PALETTE_LABELS.sections.tasks,
  project: PALETTE_LABELS.sections.projects,
  person: PALETTE_LABELS.sections.people,
  action: PALETTE_LABELS.sections.actions,
};

interface Section {
  kind: PaletteKind;
  items: PaletteItem[];
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  /** Opens the global create-task dialog. The palette closes itself first. */
  onCreateTask: () => void;
}

/**
 * ⌘K / Ctrl+K search over everything, plus the handful of commands worth
 * having without a mouse.
 *
 * The sections are presentation only — the arrow keys walk one flat, ranked
 * sequence underneath them, which is what a keyboard user expects a palette to
 * do.
 */
export function CommandPalette({
  open,
  onClose,
  onCreateTask,
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const { tasks, projects, users } = useWorkspace();
  const { toggleTheme } = useAppearance();

  const { mounted, closing } = useMountTransition(open, EXIT_MS);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const listId = "command-palette-list";

  useLockBodyScroll(mounted);
  useFocusTrap(panelRef, mounted && !closing);
  useEscapeKey(onClose, open);

  // Every open starts clean — a palette that remembers the last query makes the
  // second ⌘K feel like a stale page.
  useEffect(() => {
    if (!open) return;

    setQuery("");
    setActiveIndex(0);
  }, [open]);

  const allItems = useMemo<PaletteItem[]>(() => {
    const go = (path: string): void => {
      onClose();
      navigate(path);
    };

    const navigation = NAV_ITEMS.map<PaletteItem>((item) => ({
      id: `nav-${item.id}`,
      kind: "navigation",
      label: item.label,
      icon: item.icon,
      run: () => go(item.to),
    }));

    const taskItems = tasks.map<PaletteItem>((task) => ({
      id: `task-${task.id}`,
      kind: "task",
      label: task.title,
      hint: task.code,
      icon: ListChecks,
      keywords: [
        task.description,
        task.assignee?.name ?? "",
        ...task.tags.map((tag) => tag.label),
      ]
        .filter(Boolean)
        .join(" "),
      run: () => go(`/tasks/${task.id}`),
    }));

    const projectItems = projects.map<PaletteItem>((project) => ({
      id: `project-${project.id}`,
      kind: "project",
      label: project.name,
      hint: project.description,
      icon: FolderKanban,
      run: () => go("/projects"),
    }));

    const personItems = users.map<PaletteItem>((user) => ({
      id: `person-${user.id}`,
      kind: "person",
      label: user.name,
      hint: user.title,
      icon: Users,
      initials: user.avatar,
      keywords: user.email,
      run: () => go("/team"),
    }));

    const actionItems: PaletteItem[] = [
      {
        id: "action-create-task",
        kind: "action",
        label: PALETTE_LABELS.createTask,
        icon: Plus,
        run: () => {
          onClose();
          onCreateTask();
        },
      },
      {
        id: "action-all-tasks",
        kind: "action",
        label: PALETTE_LABELS.goToTasks,
        icon: ListChecks,
        run: () => go("/tasks"),
      },
      {
        id: "action-toggle-theme",
        kind: "action",
        label: PALETTE_LABELS.toggleTheme,
        icon: SunMoon,
        run: () => {
          onClose();
          toggleTheme();
        },
      },
    ];

    return [
      ...navigation,
      ...taskItems,
      ...projectItems,
      ...personItems,
      ...actionItems,
    ];
  }, [tasks, projects, users, navigate, onClose, onCreateTask, toggleTheme]);

  const sections = useMemo<Section[]>(() => {
    const needle = query.trim();

    const ranked = needle
      ? allItems
          .map((item) => ({
            item,
            score: scoreFields(
              [item.label, item.hint ?? "", item.keywords ?? ""],
              needle,
            ),
          }))
          .filter((entry) => entry.score > 0)
          .sort((a, b) => b.score - a.score)
          .map((entry) => entry.item)
      : allItems;

    const byKind = new Map<PaletteKind, PaletteItem[]>();

    for (const item of ranked) {
      const bucket = byKind.get(item.kind) ?? [];
      // Capped per section so one long collection cannot bury the others.
      if (bucket.length < MAX_PER_SECTION) bucket.push(item);
      byKind.set(item.kind, bucket);
    }

    return SECTION_ORDER.map((kind) => ({
      kind,
      items: byKind.get(kind) ?? [],
    })).filter((section) => section.items.length > 0);
  }, [allItems, query]);

  const flat = useMemo(
    () => sections.flatMap((section) => section.items),
    [sections],
  );

  const indexById = useMemo(
    () => new Map(flat.map((item, index) => [item.id, index])),
    [flat],
  );

  // The ranked list changes shape as the user types; keep the highlight valid.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Follow the highlight with the scroll port rather than the page.
  useEffect(() => {
    const active = listRef.current?.querySelector('[data-active="true"]');
    if (active instanceof HTMLElement) active.scrollIntoView({ block: "nearest" });
  }, [activeIndex, flat]);

  const activeItem = flat[activeIndex];

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (flat.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % flat.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + flat.length) % flat.length);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(flat.length - 1);
        break;
      case "Enter":
        event.preventDefault();
        activeItem?.run();
        break;
      default:
        break;
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-70 flex items-start justify-center p-4 pt-[10svh] sm:pt-[14svh]">
      <Backdrop closing={closing} onClick={onClose} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={PALETTE_LABELS.title}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex max-h-[70svh] w-full max-w-xl flex-col overflow-hidden outline-none",
          "rounded-2xl border border-line bg-surface shadow-lg",
          closing ? "animate-scale-out" : "animate-scale-in",
        )}
      >
        <div className="relative shrink-0 border-b border-line">
          <Search
            aria-hidden
            className="pointer-events-none absolute inset-s-4 top-1/2 size-4 -translate-y-1/2 text-subtle"
          />

          <input
            type="text"
            value={query}
            autoFocus
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PALETTE_LABELS.placeholder}
            aria-label={PALETTE_LABELS.title}
            role="combobox"
            aria-expanded
            aria-controls={listId}
            aria-activedescendant={
              activeItem ? `palette-${activeItem.id}` : undefined
            }
            aria-autocomplete="list"
            className="h-13 w-full bg-transparent ps-11 pe-11 text-sm text-content outline-none placeholder:text-subtle"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label={ACTION_LABELS.close}
            className="absolute inset-e-3 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-content"
          >
            <X aria-hidden className="size-3.5" />
          </button>
        </div>

        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={
            query.trim()
              ? PALETTE_LABELS.resultsCount(toPersianDigits(flat.length))
              : PALETTE_LABELS.idle
          }
          className="scrollbar-slim min-h-0 flex-1 overflow-y-auto p-2"
        >
          {flat.length === 0 ? (
            <li className="flex flex-col items-center gap-1 px-4 py-12 text-center">
              <p className="text-[13px] font-medium text-content">
                {PALETTE_LABELS.noResults}
              </p>
              <p className="text-[11px] text-subtle">
                {PALETTE_LABELS.noResultsHint}
              </p>
            </li>
          ) : (
            sections.map((section) => (
              <li
                key={section.kind}
                role="group"
                aria-label={SECTION_LABELS[section.kind]}
              >
                <p
                  aria-hidden
                  className="px-2.5 pt-3 pb-1.5 text-[10px] font-semibold text-subtle"
                >
                  {SECTION_LABELS[section.kind]}
                </p>

                <ul role="presentation">
                  {section.items.map((item) => {
                    const index = indexById.get(item.id) ?? 0;
                    const active = index === activeIndex;
                    const Icon = item.icon;

                    return (
                      <li
                        key={item.id}
                        id={`palette-${item.id}`}
                        role="option"
                        aria-selected={active}
                        data-active={active || undefined}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => item.run()}
                        className={cn(
                          "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-100",
                          active ? "bg-surface-2" : "hover:bg-surface-2/60",
                        )}
                      >
                        {item.initials ? (
                          <Avatar
                            name={item.label}
                            initials={item.initials}
                            seed={item.id}
                            size="xs"
                          />
                        ) : (
                          <span
                            aria-hidden
                            className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-muted"
                          >
                            <Icon className="size-3.5" />
                          </span>
                        )}

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-content">
                            {item.label}
                          </span>
                          {item.hint && item.kind !== "task" && (
                            <span className="block truncate text-[10px] text-subtle">
                              {item.hint}
                            </span>
                          )}
                        </span>

                        {item.kind === "task" && (
                          <span className="shrink-0 font-mono text-[10px] text-subtle">
                            {item.hint}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>

        <footer className="flex shrink-0 items-center gap-3 border-t border-line bg-surface-2/50 px-3 py-2">
          <span className="flex items-center gap-1 text-[10px] text-subtle">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <span className="ms-0.5">{PALETTE_LABELS.hintArrowKeys}</span>
          </span>

          <span className="flex items-center gap-1 text-[10px] text-subtle">
            <Kbd>
              <CornerDownLeft aria-hidden className="size-2.5" />
            </Kbd>
            <span className="ms-0.5">{PALETTE_LABELS.hintEnter}</span>
          </span>

          <span className="hidden items-center gap-1 text-[10px] text-subtle sm:flex">
            <Kbd>Esc</Kbd>
            <span className="ms-0.5">{PALETTE_LABELS.hintEscape}</span>
          </span>

          <span className="ms-auto truncate text-[10px] text-subtle">
            {query.trim()
              ? PALETTE_LABELS.resultsCount(toPersianDigits(flat.length))
              : PALETTE_LABELS.idleHint}
          </span>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
