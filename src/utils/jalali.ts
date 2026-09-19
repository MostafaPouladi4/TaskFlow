/**
 * Jalali (Solar Hijri) ⇄ Gregorian conversion.
 *
 * This is the standard arithmetic algorithm used by every Jalali date
 * library (the `jalaali-js` lineage): a break-year table gives the day the
 * year starts on, and conversions go through a Julian Day Number so month
 * lengths never need special-casing.
 *
 * Implemented locally rather than pulled from npm — it's ~70 lines of pure
 * date math with no dependencies, and it keeps the app free of a runtime
 * calendar library.
 */

export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

/** Gregorian↔JDN helpers -------------------------------------------------- */

function div(a: number, b: number): number {
  return Math.trunc(a / b);
}

function mod(a: number, b: number): number {
  return a - Math.trunc(a / b) * b;
}

/** Gregorian date → Julian Day Number. */
function gregorianToJdn(gy: number, gm: number, gd: number): number {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;

  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

/** Julian Day Number → Gregorian date. */
function jdnToGregorian(jdn: number): { gy: number; gm: number; gd: number } {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;

  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);

  return { gy, gm, gd };
}

/** Jalali year boundaries ------------------------------------------------- */

/** Years at which the 33-year leap cycle pattern restarts. */
const BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
  2192, 2262, 2324, 2394, 2456, 3178,
];

interface JalCal {
  /** Years since the last leap year, 0–4. **`0` means this year is a leap year.** */
  leap: number;
  /** Gregorian year the Jalali year starts in. */
  gy: number;
  /** Day of March (Gregorian) on which 1 Farvardin falls. */
  march: number;
}

function jalaliCalendar(jy: number, withoutLeap = false): JalCal {
  const bl = BREAKS.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = BREAKS[0];
  let jump = 0;

  if (jy < jp || jy >= BREAKS[bl - 1]) {
    throw new RangeError(`سال شمسی نامعتبر: ${jy}`);
  }

  for (let i = 1; i < bl; i += 1) {
    const jm = BREAKS[i];
    jump = jm - jp;
    if (jy < jm) break;

    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }

  let n = jy - jp;
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  let leap = 0;
  if (!withoutLeap) {
    if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
    leap = mod(mod(n + 1, 33) - 1, 4);
    if (leap === -1) leap = 4;
  }

  return { leap, gy, march };
}

/** Jalali date → Julian Day Number. */
function jalaliToJdn(jy: number, jm: number, jd: number): number {
  const r = jalaliCalendar(jy, true);
  return (
    gregorianToJdn(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
  );
}

/** Julian Day Number → Jalali date. */
function jdnToJalali(jdn: number): JalaliDate {
  const { gy } = jdnToGregorian(jdn);
  let jy = gy - 621;
  const r = jalaliCalendar(jy, false);
  const jdn1f = gregorianToJdn(gy, 3, r.march);
  let k = jdn - jdn1f;

  if (k >= 0) {
    if (k <= 185) {
      return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }

  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
}

/** Public API -------------------------------------------------------------- */

const toUtcMidnight = (date: Date): Date =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

export function gregorianToJalali(date: Date): JalaliDate {
  const utc = toUtcMidnight(date);
  return jdnToJalali(
    gregorianToJdn(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate()),
  );
}

/** Returns a local-midnight `Date` so day comparisons stay stable. */
export function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  const { gy, gm, gd } = jdnToGregorian(jalaliToJdn(jy, jm, jd));
  return new Date(gy, gm - 1, gd);
}

/** Jalali months 1–6 have 31 days, 7–11 have 30, Esfand has 29 or 30. */
export function jalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeapYear(jy) ? 30 : 29;
}

export function isJalaliLeapYear(jy: number): boolean {
  return jalaliCalendar(jy, false).leap === 0;
}

/** ISO `yyyy-mm-dd` (the storage format) → `Date` at local midnight. */
export function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** `Date` → ISO `yyyy-mm-dd`, the format `<input type="date">` and the store use. */
export function dateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

/** Saturday-first, matching the Persian week. */
export const JALALI_WEEKDAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
] as const;

export const JALALI_WEEKDAYS_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;

/** JS `getDay()` is Sunday-first; the Persian week starts on Saturday. */
export function persianWeekdayIndex(date: Date): number {
  return (date.getDay() + 1) % 7;
}
