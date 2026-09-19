import { useContext } from "react";
import { AppearanceContext, type AppearanceContextValue } from "../store/appearanceContext";

/**
 * Reads the appearance context. Throws when used outside the provider so a
 * misplaced component fails loudly during development instead of silently
 * rendering with default styling.
 */
export function useAppearance(): AppearanceContextValue {
  const context = useContext(AppearanceContext);

  if (!context) {
    throw new Error("useAppearance باید داخل AppearanceProvider استفاده شود.");
  }

  return context;
}
