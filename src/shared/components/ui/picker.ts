/**
 * The shape every picker (combobox, multi-select, mention menu) renders.
 *
 * Deliberately a plain view model rather than a domain type: the same control
 * serves users, tags and projects, so it takes the three or four things it
 * actually draws and nothing else. Generic over the value so a picker over
 * `TaskStatus` hands back a `TaskStatus`, not a bare string.
 */
export interface PickerOption<TValue extends string = string> {
  value: TValue;
  label: string;
  /** Secondary line — a role, an email, a task code. */
  description?: string;
  /** Avatar initials. When present a chip is drawn before the label. */
  initials?: string;
  /** Tailwind background class for the leading dot (tags, statuses). */
  dotClassName?: string;
  disabled?: boolean;
}
