"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="font-mono text-sm text-state-danger">Error</span>
      <h1 className="font-display text-3xl text-foreground">Something went wrong</h1>
      <p className="max-w-sm text-sm text-foreground-muted">
        An unexpected error occurred. You can try again, or head back to the home page.
      </p>
      <Button onClick={reset} className="mt-2">
        Try again
      </Button>
    </div>
  );
}
