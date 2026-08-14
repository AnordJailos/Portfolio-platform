import { SignalWaveform } from "@/components/portfolio/signal-waveform";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-1 py-2">
      <SignalWaveform bars={4} className="h-4" />
      <span className="font-mono text-xs text-foreground-faint">thinking…</span>
    </div>
  );
}
