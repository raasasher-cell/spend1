import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantStyles = {
  primary: "bg-blue-700 hover:bg-blue-800 text-white border border-blue-700",
  secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200",
  danger: "bg-red-600 hover:bg-red-700 text-white border border-red-600",
  ghost: "bg-transparent hover:bg-slate-100 text-slate-600 border border-transparent",
  outline: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export function Button({ variant = "secondary", size = "md", children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
