"use client";

import { cn } from "@/lib/utils";

/**
 * The site's signature element (see tailwind.config.ts design-token comment).
 * A small waveform mark ties the "AI digital twin" concept to a recurring
 * visual motif instead of a generic logo — used small & static as a
 * wordmark glyph (SignalMark) and larger & animated as a "the twin is
 * listening/typing" indicator (SignalWaveform).
 */

export function SignalMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("shrink-0", className)} aria-hidden="true">
      <defs>
        <linearGradient id="signalMarkGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5A623" />
          <stop offset="1" stopColor="#7C6CF0" />
        </linearGradient>
      </defs>
      <rect x="2" y="10" width="3" height="4" rx="1.5" fill="url(#signalMarkGradient)" />
      <rect x="7.5" y="6" width="3" height="12" rx="1.5" fill="url(#signalMarkGradient)" />
      <rect x="13" y="2" width="3" height="20" rx="1.5" fill="url(#signalMarkGradient)" />
      <rect x="18.5" y="8" width="3" height="8" rx="1.5" fill="url(#signalMarkGradient)" />
    </svg>
  );
}

/** Animated variant — bars pulse to suggest the assistant is "live". Used in hero + chat typing indicator. */
export function SignalWaveform({
  className,
  bars = 5,
  active = true,
}: {
  className?: string;
  bars?: number;
  active?: boolean;
}) {
  return (
    <div className={cn("flex items-end gap-1", className)} role="img" aria-label="Signal waveform">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-1 rounded-full bg-signal-gradient",
            active && "animate-pulse-signal"
          )}
          style={{
            height: "100%",
            animationDelay: `${i * 0.12}s`,
            opacity: active ? undefined : 0.4,
          }}
        />
      ))}
    </div>
  );
}
