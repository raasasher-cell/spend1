"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  LayoutDashboard, Bell, Users, Briefcase, FileText,
  BarChart3, Settings, ShieldCheck, Upload, Download, LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/alerts", icon: Bell, label: "Alerts" },
  { href: "/customers", icon: Users, label: "Customers" },
  { href: "/cases", icon: Briefcase, label: "Cases" },
  { href: "/sar-reviews", icon: FileText, label: "SAR Reviews" },
  { href: "/kpi-reports", icon: BarChart3, label: "KPI Reports" },
];

const toolItems = [
  { href: "/import", icon: Upload, label: "Import Data" },
  { href: "/export", icon: Download, label: "Export / Exam" },
  { href: "/admin", icon: Settings, label: "Admin" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useCurrentUser();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function NavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
    const isActive = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link href={href} className={cn(
        "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group",
        isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
      )}>
        <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
        {label}
      </Link>
    );
  }

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

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
        <div className="space-y-0.5">
          {navItems.map(item => <NavLink key={item.href} {...item} />)}
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1">Tools</p>
          <div className="space-y-0.5">
            {toolItems.map(item => <NavLink key={item.href} {...item} />)}
          </div>
        </div>
      </nav>

      <div className="px-3 py-3 border-t border-slate-700/50">
        {user ? (
          <div className="px-3 py-2">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate">{user.name}</div>
                <div className="text-slate-400 text-[10px] truncate">{user.role}</div>
              </div>
            </div>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        ) : (
          <div className="px-3 py-2 h-16" />
        )}
      </div>
    </aside>
  );
}
