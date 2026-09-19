import { ChevronDown, X } from "lucide-react";
import { useId, useRef } from "react";
import { PICKER_LABELS } from "../../constants/labels";
import { cn } from "../../utils/cn";
import { useDisclosure, useOnClickOutside } from "../../hooks/useDisclosure";
import { useMountTransition } from "../../hooks/useMountTransition";
import { toggleValue } from "../../utils/filter";
import { controlClasses, type FieldSize } from "./Field";
import { PickerPanel } from "./PickerPanel";
import type { PickerOption } from "./picker";

export interface MultiSelectProps<TValue extends string> {
  values: TValue[];
  onChange: (values: TValue[]) => void;
  options: PickerOption<TValue>[];
  /** Accessible name for the control. */
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  /** Selections beyond this count collapse into a `+N` chip. */
  maxVisible?: number;
  invalid?: boolean;
  disabled?: boolean;
  size?: FieldSize;
  id?: string;
}

const EXIT_MS = 140;
const DEFAULT_MAX_VISIBLE = 3;

/**
 * Multi-select over the same option shape as the combobox.
 *
 * The panel stays open between picks — choosing several people should not mean
 * reopening the menu each time — and each chip can be removed in place.
 */
export function MultiSelect<TValue extends string>({
  values,
  onChange,
  options,
  label,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  maxVisible = DEFAULT_MAX_VISIBLE,
  invalid = false,
  disabled = false,
  size = "md",
  id,
}: MultiSelectProps) {
  const { isOpen, close, toggle } = useDisclosure();
  const { mounted, closing } = useMountTransition(isOpen, EXIT_MS);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const controlId = id ?? `${listId}-control`;

  useOnClickOutside(wrapperRef, close, isOpen);

  const chosen = values
    .map((value) => options.find((option) => option.value === value))
    .filter((option): option is PickerOption<TValue> => option !== undefined);

  const visible = chosen.slice(0, maxVisible);
  const overflow = chosen.length - visible.length;

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
          "flex h-auto min-h-10 flex-wrap items-center gap-1.5 py-1.5 text-start",
        )}
      >
        {chosen.length === 0 && (
          <span className="min-w-0 flex-1 truncate text-subtle">
            {placeholder}
          </span>
        )}

        {visible.map((option) => (
          <span
            key={option.value}
            className="inline-flex max-w-full items-center gap-1 rounded-md bg-surface-2 py-0.5 ps-1.5 pe-1 text-[11px] font-medium text-content"
          >
            <span className="truncate">{option.label}</span>
            <span
              role="button"
              tabIndex={-1}
              aria-label={PICKER_LABELS.removeOption(option.label)}
              onClick={(event) => {
                event.stopPropagation();
                onChange(values.filter((value) => value !== option.value));
              }}
              className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-sm text-subtle hover:bg-line hover:text-content"
            >
              <X aria-hidden className="size-2.5" />
            </span>
          </span>
        ))}

        {overflow > 0 && (
          <span className="inline-flex items-center rounded-md bg-brand-500/10 px-1.5 py-0.5 text-[11px] font-medium text-brand-600 dark:text-brand-400">
            +{overflow}
          </span>
        )}

        <ChevronDown
          aria-hidden
          className={cn(
            "ms-auto size-4 shrink-0 text-subtle transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
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
            multiple
            options={options}
            isSelected={(value) => values.includes(value)}
            onPick={(value) => onChange(toggleValue(values, value))}
            searchPlaceholder={searchPlaceholder}
            emptyLabel={emptyLabel}
            onDismiss={close}
          />
        </div>
      )}
    </div>
  );
}
