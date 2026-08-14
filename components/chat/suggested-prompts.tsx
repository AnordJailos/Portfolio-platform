import { SUGGESTED_PROMPTS } from "@/lib/constants";

export function SuggestedPrompts({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-wider text-foreground-faint">Try asking</p>
      <div className="flex max-w-lg flex-wrap justify-center gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground-muted transition-colors hover:border-signal-amber/40 hover:text-foreground"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
