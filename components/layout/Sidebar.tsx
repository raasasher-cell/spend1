"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bell,
  Users,
  Briefcase,
  FileText,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/alerts", icon: Bell, label: "Alerts", badge: "32" },
  { href: "/customers", icon: Users, label: "Customers" },
  { href: "/cases", icon: Briefcase, label: "Cases", badge: "15" },
  { href: "/sar-reviews", icon: FileText, label: "SAR Reviews", badge: "7" },
  { href: "/kpi-reports", icon: BarChart3, label: "KPI Reports" },
  { href: "/admin", icon: Settings, label: "Admin" },
  { href: "/settings", icon: ShieldCheck, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-slate-900 flex flex-col z-40">
      <div className="px-5 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-500 rounded flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white text-sm font-bold leading-tight">RiskOps OS</div>
            <div className="text-slate-400 text-[10px] font-medium">Compliance Platform</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                  {item.label}
                </div>
                {item.badge && (
                  <span className={cn(
                    "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                    isActive ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-300"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">SC</div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">Sarah Chen</div>
            <div className="text-slate-400 text-[10px] truncate">BSA Officer</div>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-500" />
        </div>
      </div>
    </aside>
  );
}
