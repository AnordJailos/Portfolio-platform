"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SITE, SUGGESTED_PROMPTS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignalWaveform } from "@/components/portfolio/signal-waveform";
import { SectionHeading } from "@/components/portfolio/section-heading";

export function AiAssistantPreview() {
  const router = useRouter();

  return (
    <section className="container py-24">
      <SectionHeading eyebrow="Digital twin" title="Ask my AI assistant" />
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground-muted">
        Trained on my real projects, experience, and FAQs — it answers questions about my
        work in real time, with sources, so you don't have to wait for an email back.
      </p>

      <Card className="mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-glass-sheen px-6 py-4">
          <div className="flex items-center gap-3">
            <SignalWaveform bars={4} className="h-5" />
            <span className="font-mono text-xs text-foreground-muted">{SITE.name}'s AI twin — online</span>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/assistant">
              Open full chat <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-3 p-6">
          <p className="text-xs font-mono uppercase tracking-wider text-foreground-faint">Try asking</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => router.push(`/assistant?q=${encodeURIComponent(prompt)}`)}
                className="rounded-full border border-border bg-surface px-4 py-2 text-left text-sm text-foreground-muted transition-colors hover:border-signal-amber/40 hover:text-foreground"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
}
