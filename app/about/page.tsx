import type { Metadata } from "next";
import Image from "next/image";
import { Download, Trophy } from "lucide-react";
import { SITE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { formatFullDate } from "@/lib/utils";
import { Timeline } from "@/components/portfolio/timeline";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const achievements = await prisma.achievement.findMany({ orderBy: { order: "asc" } }).catch(() => []);

  return (
    <div className="container py-20">
      <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-start gap-6">
          <div className="relative aspect-square w-40 overflow-hidden rounded-lg border border-border bg-surface-raised">
            <Image src={SITE.avatarUrl} alt={SITE.name} fill className="object-cover" sizes="160px" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-foreground">{SITE.name}</h1>
            <p className="text-sm text-foreground-muted">{SITE.tagline}</p>
            <p className="mt-1 text-xs text-foreground-faint">{SITE.location}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href={SITE.resumeUrl} download>
              <Download className="h-4 w-4" /> Download résumé
            </a>
          </Button>
        </div>

        <div>
          <SectionHeading eyebrow="About" title="A little about me" />
          <div className="mt-6 flex flex-col gap-4 text-base leading-relaxed text-foreground-muted">
            {SITE.longBio.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-24">
        <Timeline />
      </div>

      {achievements.length > 0 && (
        <div className="mt-24">
          <SectionHeading eyebrow="Milestones" title="Achievements" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex gap-3 p-5">
                  <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-signal-amber" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    {a.description && <p className="mt-1 text-xs text-foreground-muted">{a.description}</p>}
                    {a.date && <p className="mt-1 font-mono text-xs text-foreground-faint">{formatFullDate(a.date)}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
