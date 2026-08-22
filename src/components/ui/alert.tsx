import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "default" | "destructive" | "success";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const variants: Record<AlertVariant, string> = {
  default: "border-white/10 bg-white/5 text-slate-300",
  destructive: "border-rose-400/30 bg-rose-500/10 text-rose-100",
  success: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
};

export function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn("rounded-2xl border p-4 text-sm font-medium leading-6", variants[variant], className)}
      {...props}
    />
  );
}
