import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { ERROR_LABELS } from "../constants/labels";
import { toPersianDigits } from "../utils/text";
import { Button } from "../components/ui/Button";

/**
 * The 404.
 *
 * Rendered inside the app shell so a mistyped URL still leaves the navigation
 * reachable, rather than stranding the user on a dead end.
 */
export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <span className="mb-6 inline-flex size-16 items-center justify-center rounded-2xl border border-line bg-surface-2">
        <Compass aria-hidden className="size-7 text-subtle" />
      </span>

      <p className="numeric text-4xl font-semibold tracking-tight text-content">
        {toPersianDigits("404")}
      </p>

      <h1 className="mt-3 text-lg font-semibold text-content">
        {ERROR_LABELS.notFoundTitle}
      </h1>

      <p className="mt-2 max-w-sm text-[13px] leading-6 text-muted">
        {ERROR_LABELS.notFoundBody}
      </p>

      <Button
        variant="primary"
        className="mt-6"
        onClick={() => void navigate("/")}
      >
        {ERROR_LABELS.backHome}
      </Button>
    </main>
  );
}
