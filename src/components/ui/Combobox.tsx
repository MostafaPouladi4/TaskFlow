import { ChevronDown, X } from "lucide-react";
import { useId, useRef } from "react";
import { PICKER_LABELS } from "../../constants/labels";
import { cn } from "../../utils/cn";
import { useDisclosure, useOnClickOutside } from "../../hooks/useDisclosure";
import { useMountTransition } from "../../hooks/useMountTransition";
import { controlClasses, type FieldSize } from "./Field";
import { PickerPanel } from "./PickerPanel";
import type { PickerOption } from "./picker";

export interface ComboboxProps<TValue extends string> {
  value: TValue | null;
  onChange: (value: TValue | null) => void;
  options: PickerOption<TValue>[];
  /** Accessible name for the control. */
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  /** Shows a clear button once something is selected — for optional fields. */
  clearable?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  size?: FieldSize;
  id?: string;
}

const EXIT_MS = 140;
/**
 * Single-select picker with a search field — used where a native `<select>`
 * would be unusable, such as choosing an assignee from a long team list.
 */
export function Combobox<TValue extends string>({
  value,
  onChange,
  options,
  label,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  clearable = false,
  invalid = false,
  disabled = false,
  size = "md",
  id,
}: ComboboxProps) {
  const { isOpen, close, toggle } = useDisclosure();
  const { mounted, closing } = useMountTransition(isOpen, EXIT_MS);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const controlId = id ?? `${listId}-control`;

  useOnClickOutside(wrapperRef, close, isOpen);

  const selected = options.find((option) => option.value === value) ?? null;
  const showClear = clearable && selected !== null && !disabled;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        id={controlId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
        onClick={toggle}
        className={cn(
          controlClasses(invalid, size),
          "flex items-center gap-2 text-start",
        )}
      >
        {selected?.initials && (
          <span
            aria-hidden
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-[9px] font-semibold text-brand-600 dark:text-brand-400"
          >
            {selected.initials}
          </span>
        )}

        {selected?.dotClassName && (
          <span
            aria-hidden
            className={cn("size-2 shrink-0 rounded-full", selected.dotClassName)}
          />
        )}

        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            selected ? "text-content" : "text-subtle",
          )}
        >
          {selected ? selected.label : placeholder}
        </span>

        {showClear ? (
          <span
            role="button"
            tabIndex={-1}
            aria-label={PICKER_LABELS.clearSelection}
            onClick={(event) => {
              event.stopPropagation();
              onChange(null);
            }}
            className="-me-1 inline-flex size-5 shrink-0 items-center justify-center rounded-md text-subtle hover:bg-surface-2 hover:text-content"
          >
            <X aria-hidden className="size-3.5" />
          </span>
        ) : (
          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 shrink-0 text-subtle transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        )}
      </button>

      {mounted && (
        <div
          className={cn(
            "absolute inset-s-0 top-full z-50 mt-1.5 w-full min-w-56",
            closing ? "animate-scale-out" : "animate-scale-in",
          )}
        >
          <PickerPanel
            listId={listId}
            options={options}
            isSelected={(optionValue) => optionValue === value}
            onPick={(picked) => {
              onChange(picked);
              close();
            }}
            searchPlaceholder={searchPlaceholder}
            emptyLabel={emptyLabel}
            onDismiss={close}
          />
        </div>
      )}
    </div>
  );
}
