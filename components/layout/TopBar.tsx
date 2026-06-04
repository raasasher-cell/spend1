"use client";
import { useState, useEffect } from "react";
import { Search, Bell, HelpCircle, X, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";

type AlertResult = { id: string; type: string; customerName: string };
type CustomerResult = { id: string; name: string; type: string; riskRating: string };
type CaseResult = { id: string; status: string; customerName: string };

export function TopBar() {
  const { user } = useCurrentUser();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  const [showResults, setShowResults] = useState(false);
  const [fetched, setFetched] = useState<{ alerts: AlertResult[]; customers: CustomerResult[]; cases: CaseResult[] }>({ alerts: [], customers: [], cases: [] });

  const shouldSearch = query.length >= 2;
  const alertResults = shouldSearch ? fetched.alerts : [];
  const customerResults = shouldSearch ? fetched.customers : [];
  const caseResults = shouldSearch ? fetched.cases : [];

  useEffect(() => {
    if (!shouldSearch) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const q = encodeURIComponent(query);
        const [alertsRes, customersRes, casesRes] = await Promise.all([
          fetch(`/api/alerts?q=${q}&pageSize=3`).then(r => r.json()),
          fetch(`/api/customers?q=${q}&pageSize=3`).then(r => r.json()),
          fetch(`/api/cases?q=${q}&pageSize=3`).then(r => r.json()),
        ]);
        if (!cancelled) {
          setFetched({ alerts: alertsRes.alerts ?? [], customers: customersRes.customers ?? [], cases: casesRes.cases ?? [] });
        }
      } catch {
        // silently ignore
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, shouldSearch]);

  const hasResults = alertResults.length + customerResults.length + caseResults.length > 0;

  return (
    <header className="fixed top-0 left-56 right-0 h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4 z-30">
      <div className="flex-1 relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search alerts, customers, cases..."
          value={query}
          onChange={e => { setQuery(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className="w-full pl-9 pr-8 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent"
        />
        {query && (
          <button onClick={() => { setQuery(""); setShowResults(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
        {showResults && hasResults && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {customerResults.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">Customers</div>
                {customerResults.map(c => (
                  <Link key={c.id} href={`/customers/${c.id}`} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-sm">
                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">{c.name[0]}</div>
                    <div>
                      <div className="font-medium text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.type} · {c.riskRating} Risk</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {alertResults.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">Alerts</div>
                {alertResults.map(a => (
                  <Link key={a.id} href={`/alerts/${a.id}`} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-sm">
                    <div className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-mono">#</div>
                    <div>
                      <div className="font-medium text-slate-900">{a.id}</div>
                      <div className="text-xs text-slate-500">{a.type} · {a.customerName}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {caseResults.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">Cases</div>
                {caseResults.map(c => (
                  <Link key={c.id} href={`/cases/${c.id}`} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-sm">
                    <div className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-mono">C</div>
                    <div>
                      <div className="font-medium text-slate-900">{c.id}</div>
                      <div className="text-xs text-slate-500">{c.status} · {c.customerName}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md">
          <HelpCircle className="w-4 h-4" />
        </button>
        {user && (
          <div className="relative ml-1">
            <button onClick={() => setShowUserMenu(v => !v)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{user.role}</p>
              </div>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden"
                onBlur={() => setShowUserMenu(false)}>
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">{user.role}</span>
                </div>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
