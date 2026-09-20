"use client";

import { Button } from "@amore/ui/components/primitives/button";
import { useEffect } from "react";
import { clientErrorReporter } from "@/lib/observability/client";

// Render a generic message: server exceptions can contain internal implementation details.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => clientErrorReporter.captureException(error), [error]);

  return (
    <main>
      <h1>Something went wrong</h1>
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
