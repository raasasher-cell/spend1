"use client";
import { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore, AppToast } from "@/lib/store";

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

const STYLES = {
  success: "bg-green-50 border-green-200 text-green-900",
  error: "bg-red-50 border-red-200 text-red-900",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
  info: "bg-blue-50 border-blue-200 text-blue-900",
} as const;

const ICON_STYLES = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
} as const;

function Toast({ toast }: { toast: AppToast }) {
  const { dispatch } = useStore();
  const Icon = ICONS[toast.variant];

  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: "REMOVE_TOAST", toastId: toast.id }), 4000);
    return () => clearTimeout(t);
  }, [toast.id, dispatch]);

  return (
    <div className={cn("flex items-start gap-3 p-3.5 rounded-lg border shadow-lg text-sm min-w-[280px] max-w-sm animate-in slide-in-from-right-2 duration-200", STYLES[toast.variant])}>
      <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", ICON_STYLES[toast.variant])} />
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => dispatch({ type: "REMOVE_TOAST", toastId: toast.id })}
        className="opacity-50 hover:opacity-100 transition-opacity shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { state } = useStore();
  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2">
      {state.toasts.slice(-4).map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
