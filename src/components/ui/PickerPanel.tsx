import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search } from "lucide-react";
import { cn } from "../../utils/cn";
import { scoreMatch } from "../../utils/search";
import type { PickerOption } from "./picker";

export interface PickerPanelProps<TValue extends string> {
  options: PickerOption<TValue>[];
  /** Marks the option as already chosen — a tick, or a filled checkbox. */
  isSelected: (value: TValue) => boolean;
  onPick: (value: TValue) => void;
  searchPlaceholder: string;
  emptyLabel: string;
  multiple?: boolean;
  /** Id of the listbox, so the combobox input can point `aria-controls` at it. */
  listId: string;
  onDismiss: () => void;
}

/**
 * The search field plus result list shared by the combobox and the
 * multi-select.
 *
 * Focus stays in the text field the whole time and the highlighted row is
 * announced through `aria-activedescendant` — the standard combobox pattern,
 * and the only one that keeps typing uninterrupted while arrowing through
 * results.
 */
export function PickerPanel<TValue extends string>({
  options,
  isSelected,
  onPick,
  searchPlaceholder,
  emptyLabel,
  multiple = false,
  listId,
  onDismiss,
}: PickerPanelProps<TValue>) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return options;

    return options
      .map((option) => ({
        option,
        score: Math.max(
          scoreMatch(option.label, query),
          option.description ? scoreMatch(option.description, query) : 0,
        ),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.option);
  }, [options, query]);

  // The list shrinks as the user types; keep the highlight in range.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // Follow the highlight with the scroll port rather than the page.
  useEffect(() => {
    const list = listRef.current;
    const active = list?.children[activeIndex];
    if (active instanceof HTMLElement) {
      active.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const handleKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>,
  ): void => {
    if (results.length === 0) {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % results.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + results.length) % results.length);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(results.length - 1);
        break;
      case "Enter": {
        event.preventDefault();
        const option = results[activeIndex];
        if (option && !option.disabled) onPick(option.value);
        break;
      }
      case "Escape":
        event.preventDefault();
        onDismiss();
        break;
      default:
        break;
    }
  };

  const activeId =
    results.length > 0 ? `${listId}-opt-${results[activeIndex]?.value}` : undefined;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
      <div className="relative border-b border-line">
        <Search
          aria-hidden
          className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={searchPlaceholder}
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          className="h-10 w-full bg-transparent ps-9 pe-3 text-sm text-content outline-none placeholder:text-subtle"
        />
      </div>

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-multiselectable={multiple || undefined}
        aria-label={searchPlaceholder}
        className="scrollbar-slim max-h-60 overflow-y-auto p-1"
      >
        {results.length === 0 && (
          <li className="px-3 py-6 text-center text-xs text-subtle">
            {emptyLabel}
          </li>
        )}

        {results.map((option, index) => {
          const selected = isSelected(option.value);
          const active = index === activeIndex;

          return (
            <li
              key={option.value}
              id={`${listId}-opt-${option.value}`}
              role="option"
              aria-selected={selected}
              aria-disabled={option.disabled || undefined}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => {
                // Keep focus in the input so the pick doesn't blur the panel.
                event.preventDefault();
              }}
              onClick={() => {
                if (!option.disabled) onPick(option.value);
              }}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-100",
                option.disabled && "cursor-not-allowed opacity-50",
                active && !option.disabled && "bg-surface-2",
              )}
            >
              {option.initials && (
                <span
                  aria-hidden
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-[10px] font-semibold text-brand-600 dark:text-brand-400"
                >
                  {option.initials}
                </span>
              )}

              {option.dotClassName && (
                <span
                  aria-hidden
                  className={cn("size-2 shrink-0 rounded-full", option.dotClassName)}
                />
              )}

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-content">
                  {option.label}
                </span>
                {option.description && (
                  <span className="block truncate text-[11px] text-subtle">
                    {option.description}
                  </span>
                )}
              </span>

              {selected && (
                <Check
                  aria-hidden
                  className="size-3.5 shrink-0 text-brand-500"
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
