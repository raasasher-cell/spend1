import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "muted" | "outline";
  className?: string;
}

const variantStyles = {
  default: "bg-blue-100 text-blue-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-purple-100 text-purple-800",
  muted: "bg-slate-100 text-slate-600",
  outline: "border border-slate-200 text-slate-700 bg-transparent",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const variantMap: Record<string, BadgeProps["variant"]> = {
    Critical: "danger",
    High: "warning",
    Medium: "info",
    Low: "muted",
  };
  return <Badge variant={variantMap[priority] ?? "muted"}>{priority}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeProps["variant"]> = {
    Open: "default",
    "In Review": "warning",
    Escalated: "danger",
    Closed: "muted",
    "False Positive": "muted",
    "Pending EDD": "warning",
    "SAR Review": "danger",
    Active: "success",
    Suspended: "danger",
    Restricted: "warning",
    Approved: "success",
    Rejected: "danger",
    "Manual Review": "warning",
    Pending: "muted",
    Clear: "success",
    Hit: "danger",
    Filed: "success",
    "SAR Recommended": "warning",
    "SAR Approved": "info",
    "SAR Declined": "muted",
    "Pending Review": "default",
    "Continuing Review": "info",
    Low: "success",
    Medium: "warning",
    High: "danger",
    Critical: "danger",
    Completed: "success",
    Blocked: "danger",
    Reversed: "muted",
    "Pending Review_txn": "warning",
  };
  return <Badge variant={variantMap[status] ?? "muted"}>{status}</Badge>;
}

export function RiskBadge({ score }: { score: number }) {
  const variant: BadgeProps["variant"] =
    score >= 90 ? "danger" : score >= 70 ? "warning" : score >= 50 ? "info" : "success";
  return <Badge variant={variant}>{score}</Badge>;
}
