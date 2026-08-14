import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-signal-violet/15 text-signal-violet",
        amber: "border-transparent bg-signal-amber/15 text-signal-amber",
        outline: "border-border text-foreground-muted",
        success: "border-transparent bg-state-success/15 text-state-success",
        danger: "border-transparent bg-state-danger/15 text-state-danger",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
