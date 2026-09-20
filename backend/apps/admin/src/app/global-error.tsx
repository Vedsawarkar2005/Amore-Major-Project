"use client";

import { Button } from "@amore/ui/components/primitives/button";
import { useEffect } from "react";
import { clientErrorReporter } from "@/lib/observability/client";

// This boundary replaces the root layout, so it must provide its own document elements.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => clientErrorReporter.captureException(error), [error]);

  return (
    <html lang="en">
      <body>
        <main>
          <h1>Something went wrong</h1>
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        </main>
      </body>
    </html>
  );
}
