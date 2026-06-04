"use client";
import { useState } from "react";
import { Search, Bell, HelpCircle, X } from "lucide-react";
import { ALERTS, CUSTOMERS, CASES } from "@/lib/mock-data";
import Link from "next/link";

export function TopBar() {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const q = query.toLowerCase();
  const alertResults = q.length > 1 ? ALERTS.filter(a =>
    a.id.toLowerCase().includes(q) || a.customerName.toLowerCase().includes(q) || a.type.toLowerCase().includes(q)
  ).slice(0, 3) : [];
  const customerResults = q.length > 1 ? CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
  ).slice(0, 3) : [];
  const caseResults = q.length > 1 ? CASES.filter(c =>
    c.id.toLowerCase().includes(q) || c.customerName.toLowerCase().includes(q)
  ).slice(0, 3) : [];

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
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold ml-1">SC</div>
      </div>
    </header>
  );
}
