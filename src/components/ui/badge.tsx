import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "border-transparent bg-cyan-400 text-slate-950",
  secondary: "border-white/10 bg-white/8 text-slate-300",
  success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  destructive: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  outline: "border-white/10 bg-white/5 text-slate-300"
};

export function Badge({ className, variant = "secondary", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold leading-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
