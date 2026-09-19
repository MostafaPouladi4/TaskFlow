import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { ACTION_LABELS, GENERIC_LABELS, PICKER_LABELS } from "../../constants/labels";
import { useDisclosure, useOnClickOutside } from "../../hooks/useDisclosure";
import { useEscapeKey } from "../../hooks/useHotkey";
import { useMountTransition } from "../../hooks/useMountTransition";
import { cn } from "../../utils/cn";
import { formatJalaliFull, todayIso } from "../../utils/date";
import {
  JALALI_MONTHS,
  JALALI_WEEKDAYS_SHORT,
  dateToIso,
  gregorianToJalali,
  isoToDate,
  jalaliMonthLength,
  jalaliToGregorian,
  persianWeekdayIndex,
} from "../../utils/jalali";
import { toPersianDigits } from "../../utils/text";
import { controlClasses, type FieldSize } from "./Field";

const EXIT_MS = 160;

export interface DatePickerProps {
  /** ISO `yyyy-mm-dd`, or null for "no date". */
  value: string | null;
  onChange: (value: string | null) => void;
  label: string;
  placeholder: string;
  clearable?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  /** Inclusive ISO bounds — used to keep a due date after its start date. */
  min?: string | null;
  max?: string | null;
  size?: FieldSize;
}

interface MonthView {
  jy: number;
  jm: number;
}

/**
 * A Jalali (Solar Hijri) date picker.
 *
 * The value crossing this component's boundary is always an ISO Gregorian
 * string — the calendar arithmetic is purely a presentation concern, so the
 * stored data stays comparable and portable.
 */
export function DatePicker({
  value,
  onChange,
  label,
  placeholder,
  clearable = true,
  invalid = false,
  disabled = false,
  min = null,
  max = null,
  size = "md",
}: DatePickerProps) {
  const { isOpen, close, toggle } = useDisclosure();
  const { mounted, closing } = useMountTransition(isOpen, EXIT_MS);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(wrapperRef, close, isOpen);
  useEscapeKey(close, isOpen);

  const today = useMemo(() => gregorianToJalali(new Date()), []);
  const todayValue = todayIso();

  const selected = useMemo(
    () => (value ? gregorianToJalali(isoToDate(value)) : null),
    [value],
  );

  const [view, setView] = useState<MonthView>(() => {
    const base = selected ?? today;
    return { jy: base.jy, jm: base.jm };
  });

  // Reopening should land on the selected month, not wherever the user browsed
  // to last time.
  useEffect(() => {
    if (!isOpen) return;

    const base = value ? gregorianToJalali(isoToDate(value)) : today;
    setView({ jy: base.jy, jm: base.jm });
  }, [isOpen, value, today]);

  const leadingBlanks = persianWeekdayIndex(
    jalaliToGregorian(view.jy, view.jm, 1),
  );
  const monthLength = jalaliMonthLength(view.jy, view.jm);

  const shiftMonth = (delta: number): void => {
    setView((current) => {
      let month = current.jm + delta;
      let year = current.jy;

      if (month < 1) {
        month = 12;
        year -= 1;
      } else if (month > 12) {
        month = 1;
        year += 1;
      }

      return { jy: year, jm: month };
    });
  };

  const isDisabledDay = (iso: string): boolean => {
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  };

  const pick = (iso: string): void => {
    onChange(iso);
    close();
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={label}
        onClick={toggle}
        className={cn(
          controlClasses(invalid, size),
          "flex items-center gap-2 text-start",
        )}
      >
        <CalendarDays aria-hidden className="size-4 shrink-0 text-subtle" />

        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            value ? "text-content" : "text-subtle",
          )}
        >
          {value ? formatJalaliFull(value) : placeholder}
        </span>

        {clearable && value && !disabled ? (
          <span
            role="button"
            tabIndex={-1}
            aria-label={ACTION_LABELS.clear}
            onClick={(event) => {
              event.stopPropagation();
              onChange(null);
            }}
            className="-me-1 inline-flex size-5 shrink-0 items-center justify-center rounded-md text-subtle hover:bg-surface-2 hover:text-content"
          >
            <X aria-hidden className="size-3.5" />
          </span>
        ) : (
          <ChevronLeft
            aria-hidden
            className={cn(
              "size-4 shrink-0 text-subtle transition-transform duration-200",
              isOpen && "-rotate-90",
            )}
          />
        )}
      </button>

      {mounted && (
        <div
          role="dialog"
          aria-label={label}
          className={cn(
            "absolute inset-s-0 top-full z-50 mt-1.5 w-72 rounded-xl border border-line bg-surface p-3 shadow-lg",
            closing ? "animate-scale-out" : "animate-scale-in",
          )}
        >
          <div className="mb-3 flex items-center gap-1">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label={PICKER_LABELS.previousMonth}
              className="inline-flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-content"
            >
              <ChevronRight aria-hidden className="size-4" />
            </button>

            <p className="flex-1 text-center text-[13px] font-semibold text-content">
              {JALALI_MONTHS[view.jm - 1]} {toPersianDigits(view.jy)}
            </p>

            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label={PICKER_LABELS.nextMonth}
              className="inline-flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-content"
            >
              <ChevronLeft aria-hidden className="size-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {JALALI_WEEKDAYS_SHORT.map((weekday) => (
              <span
                key={weekday}
                aria-hidden
                className="py-1 text-center text-[10px] font-medium text-subtle"
              >
                {weekday}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: leadingBlanks }, (_, index) => (
              <span key={`blank-${index}`} aria-hidden />
            ))}

            {Array.from({ length: monthLength }, (_, index) => {
              const day = index + 1;
              const iso = dateToIso(
                jalaliToGregorian(view.jy, view.jm, day),
              );

              const isSelected = value === iso;
              const isToday = iso === todayValue;
              const disabledDay = isDisabledDay(iso);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabledDay}
                  aria-current={isToday ? "date" : undefined}
                  aria-pressed={isSelected}
                  onClick={() => pick(iso)}
                  className={cn(
                    "inline-flex h-8 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                    disabledDay
                      ? "cursor-not-allowed text-subtle/50"
                      : isSelected
                        ? "bg-brand-500 text-white"
                        : isToday
                          ? "bg-brand-500/10 text-brand-700 dark:text-brand-300"
                          : "text-content hover:bg-surface-2",
                  )}
                >
                  {toPersianDigits(day)}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
            <button
              type="button"
              onClick={() => pick(todayValue)}
              disabled={isDisabledDay(todayValue)}
              className="rounded-lg px-2 py-1 text-[11px] font-medium text-brand-600 transition-colors hover:bg-brand-500/10 disabled:cursor-not-allowed disabled:text-subtle dark:text-brand-400"
            >
              {GENERIC_LABELS.today}
            </button>

            {clearable && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  close();
                }}
                className="rounded-lg px-2 py-1 text-[11px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-content"
              >
                {ACTION_LABELS.clear}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
