"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";

let posthogInitialized = false;

/**
 * Two independent things happen here:
 * 1. Every page view is POSTed to /api/analytics so the admin dashboard
 *    (recharts) has first-party data, even with zero external services configured.
 * 2. If NEXT_PUBLIC_POSTHOG_KEY is set, PostHog is initialized for the
 *    site owner's own product-analytics use — entirely optional, per the brief.
 * Mounted once near the root of app/layout.tsx.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (key && !posthogInitialized) {
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
        capture_pageview: false, // we call capture manually below to also feed our own dashboard consistently
      });
      posthogInitialized = true;
    }
  }, []);

  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "PAGE_VIEW", path: pathname }),
    }).catch(() => {});

    if (posthogInitialized) posthog.capture("$pageview", { path: pathname });
  }, [pathname]);

  return <>{children}</>;
}

/** Call from a project detail page to attribute a view to a specific project (feeds the "Most-viewed projects" chart). */
export function trackProjectView(projectTitle: string, projectId: string) {
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "PROJECT_VIEW", metadata: { title: projectTitle, id: projectId } }),
  }).catch(() => {});
}
