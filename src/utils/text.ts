import { GENERIC_LABELS } from "../constants/labels";

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const EXTENDED_ARABIC_INDIC = "۰۱۲۳۴۵۶۷۸۹";

/** Latin digits → Persian digits. */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/** Persian/Arabic digits → Latin, so numeric input can be parsed. */
export function toLatinDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(EXTENDED_ARABIC_INDIC.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_INDIC.indexOf(d)));
}

/** `1234` → `۱۲۳۴`. Use for every count, total and percentage in the UI. */
export function formatNumber(value: number): string {
  return toPersianDigits(new Intl.NumberFormat("en-US").format(value));
}

export function formatPercent(value: number): string {
  return `${toPersianDigits(Math.round(value))}٪`;
}

/** Pads to two Persian digits — used by the Jalali date picker. */
export function padPersian(value: number): string {
  return toPersianDigits(String(value).padStart(2, "0"));
}

/** `علی رضایی` → `عر`. Falls back to the first letter for single names. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return GENERIC_LABELS.unknownInitial;
  if (parts.length === 1) return parts[0].slice(0, 2);

  return `${parts[0][0]}${parts[1][0]}`;
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Strips lightweight markup so a body can be previewed as plain prose. */
export function toPlainText(text: string): string {
  return text
    .replace(/@\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .trim();
}

/** Deterministic index into a palette, stable for a given string key. */
export function hashToIndex(key: string, buckets: number): number {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % buckets;
}

/** Persian has no grammatical plural marker after a numeral. */
export function countLabel(count: number, noun: string): string {
  return `${formatNumber(count)} ${noun}`;
}
