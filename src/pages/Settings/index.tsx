import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  AlignJustify,
  Bell,
  DatabaseZap,
  Globe,
  Monitor,
  Moon,
  Rows3,
  Sun,
} from "lucide-react";
import { STORAGE_KEYS } from "../../shared/constants/config";
import {
  ACTION_LABELS,
  NOTIFICATION_LABELS,
  SETTINGS_LABELS,
  USER_ROLE_LABELS,
} from "../../shared/constants/labels";
import { useAppearance } from "../../shared/hooks/useAppearance";
import type { Density, ThemePreference } from "../../store/appearanceContext";
import { useLocalStorage } from "../../shared/hooks/useLocalStorage";
import { useWorkspace } from "../../shared/hooks/useWorkspace";
import { Card, CardBody, CardHeader } from "../../shared/components/ui/Card";
import { Avatar } from "../../shared/components/ui/Avatar";
import { Button } from "../../shared/components/ui/Button";
import { Checkbox } from "../../shared/components/ui/Checkbox";
import { ConfirmDialog } from "../../shared/components/ui/ConfirmDialog";
import { Field, Input } from "../../shared/components/ui/Field";
import { SegmentedControl } from "../../shared/components/ui/SegmentedControl";
import { PageHeader } from "../../shared/components/layout/PageHeader";

/* ── Appearance ────────────────────────────────────────────────────────── */

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { value: "light", label: SETTINGS_LABELS.appearance.light, icon: Sun },
  { value: "dark", label: SETTINGS_LABELS.appearance.dark, icon: Moon },
  { value: "system", label: SETTINGS_LABELS.appearance.system, icon: Monitor },
];

const DENSITY_OPTIONS: {
  value: Density;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  {
    value: "comfortable",
    label: SETTINGS_LABELS.appearance.densityComfortable,
    icon: AlignJustify,
  },
  {
    value: "compact",
    label: SETTINGS_LABELS.appearance.densityCompact,
    icon: Rows3,
  },
];

/* ── Notification preferences ──────────────────────────────────────────── */

type PrefKey = "mentions" | "assignments" | "replies" | "dueSoon" | "digest";

const PREF_ORDER: PrefKey[] = [
  "mentions",
  "assignments",
  "replies",
  "dueSoon",
  "digest",
];

const DEFAULT_PREFS: Record<PrefKey, boolean> = {
  mentions: true,
  assignments: true,
  replies: true,
  dueSoon: true,
  digest: false,
};

const PREF_COPY: Record<PrefKey, { label: string; hint: string }> = {
  mentions: {
    label: SETTINGS_LABELS.notificationPrefs.mentions,
    hint: SETTINGS_LABELS.notificationPrefs.mentionsHint,
  },
  assignments: {
    label: SETTINGS_LABELS.notificationPrefs.assignments,
    hint: SETTINGS_LABELS.notificationPrefs.assignmentsHint,
  },
  replies: {
    label: SETTINGS_LABELS.notificationPrefs.replies,
    hint: SETTINGS_LABELS.notificationPrefs.repliesHint,
  },
  dueSoon: {
    label: SETTINGS_LABELS.notificationPrefs.dueSoon,
    hint: SETTINGS_LABELS.notificationPrefs.dueSoonHint,
  },
  digest: {
    label: SETTINGS_LABELS.notificationPrefs.digest,
    hint: SETTINGS_LABELS.notificationPrefs.digestHint,
  },
};

/* ── Small local building blocks ───────────────────────────────────────── */

interface SectionProps {
  title: string;
  description?: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

function Section({ title, description, icon, action, children }: SectionProps) {
  return (
    <Card as="section">
      <CardHeader
        title={title}
        description={description}
        icon={icon}
        action={action}
      />
      <CardBody className="flex flex-col gap-5">{children}</CardBody>
    </Card>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

/** A read-only fact. Rendered as text, not a disabled input, so it can't look editable. */
function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line pb-3 last:border-b-0 last:pb-0">
      <dt className="text-[12px] text-muted">{label}</dt>
      <dd className="text-[12px] font-medium text-content">{value}</dd>
    </div>
  );
}

/**
 * Settings.
 *
 * Appearance and notification preferences write straight through (the former to
 * the appearance provider, the latter to localStorage); everything derived from
 * the workspace is shown read-only, since this mock build has no user-write API.
 */
export function SettingsPage() {
  const { theme, setTheme, density, setDensity } = useAppearance();
  const { currentUser, actions } = useWorkspace();

  const [prefs, setPrefs] = useLocalStorage<Record<PrefKey, boolean>>(
    STORAGE_KEYS.notificationPrefs,
    DEFAULT_PREFS,
  );
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={SETTINGS_LABELS.title}
        description={SETTINGS_LABELS.subtitle}
      />

      <Section
        title={SETTINGS_LABELS.sections.appearance}
        description={SETTINGS_LABELS.appearance.themeHint}
        icon={<Sun aria-hidden className="size-4" />}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-content">
            {SETTINGS_LABELS.appearance.theme}
          </span>

          <SegmentedControl<ThemePreference>
            value={theme}
            onValueChange={setTheme}
            options={THEME_OPTIONS}
            label={SETTINGS_LABELS.appearance.theme}
            size="sm"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-content">
            {SETTINGS_LABELS.appearance.density}
          </span>

          <SegmentedControl<Density>
            value={density}
            onValueChange={setDensity}
            options={DENSITY_OPTIONS}
            label={SETTINGS_LABELS.appearance.density}
            size="sm"
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="text-[13px] font-medium text-content">
            {SETTINGS_LABELS.appearance.direction}
          </span>
          <span className="text-[12px] text-muted">
            {SETTINGS_LABELS.appearance.directionHint}
          </span>
        </div>
      </Section>

      <Section
        title={SETTINGS_LABELS.sections.profile}
        description={SETTINGS_LABELS.profile.email}
        icon={
          <Avatar
            name={currentUser.name}
            initials={currentUser.avatar}
            seed={currentUser.id}
            size="xs"
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={SETTINGS_LABELS.profile.name} htmlFor="profile-name">
            <Input id="profile-name" value={currentUser.name} readOnly disabled />
          </Field>

          <Field label={SETTINGS_LABELS.profile.email} htmlFor="profile-email">
            <Input
              id="profile-email"
              type="email"
              value={currentUser.email}
              readOnly
              disabled
              dir="ltr"
            />
          </Field>
        </div>

        <dl className="flex flex-col gap-3">
          <InfoRow
            label={SETTINGS_LABELS.profile.role}
            value={USER_ROLE_LABELS[currentUser.role]}
          />
        </dl>
      </Section>

      <Section
        title={SETTINGS_LABELS.sections.notifications}
        description={NOTIFICATION_LABELS.title}
        icon={<Bell aria-hidden className="size-4" />}
      >
        <div className="flex flex-col gap-4">
          {PREF_ORDER.map((key) => (
            <Checkbox
              key={key}
              checked={prefs[key]}
              onCheckedChange={(checked) =>
                setPrefs((current) => ({ ...current, [key]: checked }))
              }
            >
              <span className="block text-[13px] font-medium text-content">
                {PREF_COPY[key].label}
              </span>
              <span className="block text-[11px] text-subtle">
                {PREF_COPY[key].hint}
              </span>
            </Checkbox>
          ))}
        </div>
      </Section>

      <Section
        title={SETTINGS_LABELS.sections.preferences}
        description={SETTINGS_LABELS.appearance.directionHint}
        icon={<Globe aria-hidden className="size-4" />}
      >
        <dl className="flex flex-col gap-3">
          <InfoRow
            label={SETTINGS_LABELS.preferences.language}
            value={SETTINGS_LABELS.preferences.languageValue}
          />
          <InfoRow
            label={SETTINGS_LABELS.preferences.calendar}
            value={SETTINGS_LABELS.preferences.calendarValue}
          />
          <InfoRow
            label={SETTINGS_LABELS.preferences.timezone}
            value={SETTINGS_LABELS.preferences.timezoneValue}
          />
        </dl>
      </Section>

      <Section
        title={SETTINGS_LABELS.data.title}
        icon={<DatabaseZap aria-hidden className="size-4" />}
        action={
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmReset(true)}
          >
            {SETTINGS_LABELS.data.reset}
          </Button>
        }
      >
        <p className="text-[12px] leading-6 text-muted">
          {SETTINGS_LABELS.data.resetHint}
        </p>
      </Section>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => actions.resetWorkspace()}
        title={SETTINGS_LABELS.data.resetConfirmTitle}
        body={SETTINGS_LABELS.data.resetConfirmBody}
        confirmLabel={SETTINGS_LABELS.data.resetConfirm}
        cancelLabel={ACTION_LABELS.cancel}
      />
    </div>
  );
}
