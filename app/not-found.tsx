import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="font-mono text-sm text-signal-amber">404</span>
      <h1 className="font-display text-3xl text-foreground">Page not found</h1>
      <p className="max-w-sm text-sm text-foreground-muted">
        The page you're looking for doesn't exist, or may have moved.
      </p>
      <Button asChild className="mt-2">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
