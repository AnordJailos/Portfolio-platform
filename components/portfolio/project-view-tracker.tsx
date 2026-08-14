"use client";

import { useEffect } from "react";
import { trackProjectView } from "@/components/layout/analytics-provider";

export function ProjectViewTracker({ projectId, title }: { projectId: string; title: string }) {
  useEffect(() => {
    trackProjectView(title, projectId);
  }, [projectId, title]);

  return null;
}
