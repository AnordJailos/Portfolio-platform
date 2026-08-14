import { FileText, Briefcase, HelpCircle, User } from "lucide-react";
import type { ChatSource } from "@/types";
import { Badge } from "@/components/ui/badge";

const SOURCE_ICONS: Record<string, typeof FileText> = {
  PROJECT: Briefcase,
  BLOG_POST: FileText,
  FAQ: HelpCircle,
  BIO: User,
};

export function SourceCitations({ sources }: { sources: ChatSource[] }) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
      <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-faint">Sources</span>
      {sources.map((source, i) => {
        const Icon = SOURCE_ICONS[source.sourceType] ?? FileText;
        return (
          <Badge key={i} variant="outline" className="gap-1">
            <Icon className="h-3 w-3" />
            {source.title}
          </Badge>
        );
      })}
    </div>
  );
}
