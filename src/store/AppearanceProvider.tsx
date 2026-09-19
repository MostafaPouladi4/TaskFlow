import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { STORAGE_KEYS } from "../constants/config";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSystemTheme } from "../hooks/useMediaQuery";
import {
  AppearanceContext,
  type AppearanceContextValue,
  type Density,
  type ResolvedTheme,
  type ThemePreference,
} from "./appearanceContext";

/**
 * Owns the user's appearance choices and keeps the document in sync with
 * them.
 *
 * The theme is applied as a `.dark` class on `<html>`; `index.html` contains a
 * tiny inline script that applies the same class before first paint, so
 * there's no flash of the wrong theme on load.
 */
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const systemTheme = useSystemTheme();

  const [theme, setTheme] = useLocalStorage<ThemePreference>(
    STORAGE_KEYS.theme,
    "system",
  );
  const [density, setDensity] = useLocalStorage<Density>(
    STORAGE_KEYS.density,
    "comfortable",
  );

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const value = useMemo<AppearanceContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      density,
      setDensity,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme, density, setDensity],
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}
