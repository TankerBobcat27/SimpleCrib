import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-zinc-800 text-zinc-100",
        overdue: "border-transparent bg-amber-400 text-zinc-950",
        soon: "border-transparent bg-yellow-500/20 text-yellow-200",
        ok: "border-transparent bg-emerald-500/15 text-emerald-300",
        out: "border-transparent bg-rose-500/20 text-rose-200",
        outline: "border-zinc-600 text-zinc-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
