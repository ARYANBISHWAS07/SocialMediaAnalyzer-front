import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  default:
    "bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 text-white shadow-[0_12px_32px_rgba(34,211,238,0.18)] hover:brightness-110 disabled:bg-none disabled:bg-slate-800 disabled:text-slate-500",
  secondary: "bg-white/10 text-slate-100 hover:bg-white/15 disabled:text-slate-500",
  outline: "border border-white/10 bg-white/5 text-slate-200 shadow-sm hover:bg-white/10 disabled:text-slate-500",
  ghost: "text-slate-400 hover:bg-white/8 hover:text-white disabled:text-slate-600"
};

export function Button({ className, variant = "default", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
