/** Small reusable eyebrow + title heading used at the top of every content section. */
export function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <span className="font-mono text-xs uppercase tracking-wider text-signal-amber">{eyebrow}</span>
      <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">{title}</h2>
    </div>
  );
}
