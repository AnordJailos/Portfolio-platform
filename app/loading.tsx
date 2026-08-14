import { SignalWaveform } from "@/components/portfolio/signal-waveform";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <SignalWaveform bars={5} className="h-8" />
      <p className="font-mono text-xs text-foreground-faint">loading…</p>
    </div>
  );
}
