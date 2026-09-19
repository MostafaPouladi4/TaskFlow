import { Moon, Sun } from "lucide-react";
import { SETTINGS_LABELS } from "../../constants/labels";
import { useAppearance } from "../../hooks/useAppearance";
import { IconButton } from "../ui/IconButton";
import { Tooltip } from "../ui/Tooltip";

export interface ThemeToggleProps {
  className?: string;
}

/**
 * Flips between light and dark.
 *
 * A separate control from the full three-way choice in settings, which is where
 * "follow the system" lives — this is the one-click shortcut people actually
 * reach for.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useAppearance();
  const isDark = resolvedTheme === "dark";

  const next = isDark
    ? SETTINGS_LABELS.appearance.light
    : SETTINGS_LABELS.appearance.dark;

  return (
    <Tooltip content={next}>
      <IconButton
        icon={isDark ? Sun : Moon}
        label={next}
        variant="ghost"
        onClick={toggleTheme}
        className={className}
      />
    </Tooltip>
  );
}
