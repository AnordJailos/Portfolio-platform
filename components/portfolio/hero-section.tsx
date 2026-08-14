"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { SITE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { SignalWaveform } from "@/components/portfolio/signal-waveform";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient gradient glow — quiet, sits behind the content */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-signal-gradient opacity-[0.09] blur-[140px]"
      />

      <div className="container relative flex flex-col items-center pb-28 pt-24 text-center md:pt-36">
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col items-center">
          <motion.div
            variants={item}
            className="mb-6 flex items-center gap-2 rounded-full border border-border bg-surface-glass px-4 py-1.5 font-mono text-xs text-foreground-muted"
          >
            <Sparkles className="h-3.5 w-3.5 text-signal-amber" />
            AI digital twin online — ask it anything
          </motion.div>

          <motion.h1
            variants={item}
            className="max-w-3xl font-display text-5xl font-medium leading-[1.05] tracking-tight text-foreground md:text-7xl"
          >
            {SITE.name}
          </motion.h1>

          <motion.p variants={item} className="mt-3 font-display text-xl text-foreground-muted md:text-2xl">
            {SITE.tagline}
          </motion.p>

          <motion.p variants={item} className="mt-6 max-w-xl text-balance text-base leading-relaxed text-foreground-muted">
            {SITE.shortBio}
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/assistant">
                Talk to my AI twin
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/projects">View my work</Link>
            </Button>
          </motion.div>

          <motion.div variants={item} className="mt-16 flex h-8 items-center gap-1.5">
            <SignalWaveform bars={7} className="h-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
