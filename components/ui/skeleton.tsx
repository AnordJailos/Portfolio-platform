import { cn } from "@/lib/utils";

/** Shimmering placeholder shown while content streams/loads. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_25%,rgba(255,255,255,0.09)_37%,rgba(255,255,255,0.04)_63%)] bg-[length:400%_100%]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
