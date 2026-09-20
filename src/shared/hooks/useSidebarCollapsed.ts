import { STORAGE_KEYS } from "../shared/constants/config";
import { useLocalStorage } from "./useLocalStorage";

/**
 * Whether the desktop rail is collapsed. Persisted so the workspace looks the
 * same on the next visit.
 */
export function useSidebarCollapsed(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useLocalStorage<boolean>(
    STORAGE_KEYS.sidebar,
    false,
  );

  return [collapsed, () => setCollapsed((previous) => !previous)];
}
